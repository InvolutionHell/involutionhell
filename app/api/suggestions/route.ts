import { generateText } from "ai";
import { unstable_cache } from "next/cache";
import { getModel, requiresApiKey, type AIProvider } from "@/lib/ai/models";
import { createGlmFlashModel } from "@/lib/ai/providers/glm";
import { limitChat, rateLimitResponse } from "@/lib/rate-limit";
import { parseSuggestionJson } from "@/lib/ai/parse-suggestions";

// 允许流式响应最长30秒
export const maxDuration = 30;

import type { UIMessage, TextUIPart } from "ai";

interface SuggestionsRequest {
  messages: UIMessage[];
  pageContext?: {
    title?: string;
    description?: string;
    slug?: string;
  };
  provider?: AIProvider;
  apiKey?: string;
}

export async function POST(req: Request) {
  // Rate limit：suggestions 也打 LLM，共用同一 IP 额度池
  const rl = await limitChat(req, false);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const {
      messages,
      pageContext,
      provider = "intern",
      apiKey,
    }: SuggestionsRequest = await req.json();

    // 如果需要，验证 API 密钥
    if (requiresApiKey(provider) && (!apiKey || apiKey.trim() === "")) {
      return Response.json(
        { error: "需要 API 密钥 (API key is required)" },
        { status: 400 },
      );
    }

    // 模型选择策略：
    // - 若用户选了自己的 Provider（openai/gemini），用用户的模型
    // - 否则（默认 intern）优先用 GLM-4-Flash（免费且快速），若 ZHIPU_API_KEY 未配置则回退到 intern
    let model;
    if (provider !== "intern") {
      // 用户自选模型（openai / gemini）
      model = getModel(provider, apiKey);
    } else if (process.env.ZHIPU_API_KEY) {
      // 默认使用智谱 GLM-4-Flash（免费轻量）
      model = createGlmFlashModel();
    } else {
      // 兜底：仍使用 intern
      model = getModel("intern");
    }

    const isWelcomeRequest = messages.length === 0;

    let prompt = "";
    if (isWelcomeRequest) {
      // 欢迎页面的初始动态建议
      const contextInfo = [
        pageContext?.title ? `标题: ${pageContext.title}` : "",
        pageContext?.description ? `描述: ${pageContext.description}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      prompt = `请根据以下当前页面的上下文信息，生成4个引导新手用户提问的建议框内容。\n\n上下文:\n${contextInfo || "未知页面"}\n\n只返回纯JSON数组，包含4个对象，格式如：\n[{"title":"总结本文","label":"内容要点","action":"请帮我总结一下文章主要内容"}]\n其中title简短明确，label为右上角浅色标签，action为点击后自动发送的提问语句。`;
    } else {
      // 普通的跟进提问建议
      // 只取最后一条用户消息，减少 token 消耗
      const lastUserMsg = messages
        .filter((m) => m.role === "user")
        .slice(-1)[0];
      const lastText =
        (Array.isArray(lastUserMsg?.parts)
          ? lastUserMsg.parts
              .filter((p): p is TextUIPart => p.type === "text")
              .map((p) => p.text)
              .join(" ")
          : (lastUserMsg as unknown as { content?: string })?.content) ?? "";

      // 语言检测：简单判断是否包含中文字符
      const isChinese = /[\u4e00-\u9fa5]/.test(lastText);

      prompt = isChinese
        ? `用户问："${lastText}"。给出3个简短中文追问（每个不超过15字），直接返回JSON数组，例如：["问题1","问题2","问题3"]`
        : `User asked: "${lastText}". Suggest 3 short follow-up questions (max 10 words each). Return a JSON array only, e.g. ["Q1","Q2","Q3"]`;
    }

    // 将核心请求提取为一个辅助函数以便于使用 Vercel Cache
    // 注意：unstable_cache 序列化函数只能接收可序列化的对象，因此仅传递必需的参数
    const fetchSuggestionsWithCache = unstable_cache(
      async (cPrompt: string, cModelId: string) => {
        // 由于 model 不能序列化传入，在缓存函数内侧由于无法动态构建，所以此处传递标识再创建
        const m =
          cModelId === "intern"
            ? getModel("intern")
            : cModelId === "glm"
              ? createGlmFlashModel()
              : // 无法传递用户动态 key，对于配置了 key 的情况不走此函数
                getModel("intern");

        const { text } = await generateText({
          model: m,
          prompt: cPrompt,
        });
        return text;
      },
      // 使用明确具有区分度的 cache key
      [`suggestions-cache-${isWelcomeRequest ? "welcome" : "followup"}`],
      {
        revalidate: 60 * 60 * 24, // 对同一个页面的建议缓存 24 小时
        tags: ["suggestions"],
      },
    );

    let text = "";
    // 判断是否可以使用缓存（如果使用了自定义 apiKey，为了防止数据交叉，不采用公用缓存）
    if (provider !== "intern" && !process.env.ZHIPU_API_KEY) {
      const { text: directText } = await generateText({
        model,
        prompt,
      });
      text = directText;
    } else {
      // 确定内部用于缓存匹配的模型标识
      const internalModelId =
        provider === "intern"
          ? process.env.ZHIPU_API_KEY
            ? "glm"
            : "intern"
          : "intern";
      // 将缓存粒度关联到请求本身的内容上
      const suggestionKey = isWelcomeRequest
        ? `welcome-${pageContext?.slug || "default"}`
        : `followup-${prompt}`;

      const cachedFn = unstable_cache(
        async (pPrompt: string, pModelId: string) =>
          fetchSuggestionsWithCache(pPrompt, pModelId),
        [`suggestion-key-${suggestionKey}`],
        { revalidate: 3600 * 24 }, // 24小时
      );
      text = await cachedFn(prompt, internalModelId);
    }

    let questions: unknown[] = [];
    try {
      questions = parseSuggestionJson(text);
    } catch (e) {
      console.error("解析建议 JSON 失败:", e, "原始文本:", text);

      if (isWelcomeRequest) {
        // 把报错原因和原始文本暴露出来方便我调试
        return Response.json({
          questions: [],
          debugError: String(e),
          debugText: text,
        });
      } else {
        // 如果解析失败，尝试通过正则提取引号中的内容（兼容中英文引号）
        const fallbackMatches = text.match(/(?:["“])([^"”]+)(?:["”])/g);
        if (fallbackMatches && fallbackMatches.length > 0) {
          questions = fallbackMatches
            .map((m) => m.replace(/["“”]/g, "").trim())
            .filter((line) => line.length > 0);
        } else {
          // 如果连引号都没有，尝试按行分割兜底
          questions = text
            .split("\n")
            .map((line) =>
              line
                .replace(/^\d+\.\s*/, "")
                .replace(/[`"“”]/g, "")
                .trim(),
            )
            .filter(
              (line) =>
                line.length > 0 &&
                !line.startsWith("json") &&
                !line.startsWith("[") &&
                !line.startsWith("]"),
            );
        }
      }
    }

    // 确保返回的是数组
    if (!Array.isArray(questions)) {
      questions = [];
    }

    // 对于跟进建议最多返回 3 个，对于欢迎建议最多返回 4 个
    const maxCount = isWelcomeRequest ? 4 : 3;
    return Response.json({ questions: questions.slice(0, maxCount) });
  } catch (error) {
    console.error("建议 API 错误 (Suggestions API error):", error);
    return Response.json(
      { error: "无法生成建议 (Failed to generate suggestions)" },
      { status: 500 },
    );
  }
}
