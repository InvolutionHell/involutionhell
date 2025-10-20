import { streamText, UIMessage, convertToModelMessages } from "ai";
import { getModel, requiresApiKey, type AIProvider } from "@/lib/ai/models";
import { buildSystemMessage } from "@/lib/ai/prompt";

// 流式响应最长30秒
export const maxDuration = 30;

interface ChatRequest {
  messages: UIMessage[];
  system?: string;
  tools?: unknown;
  pageContext?: {
    title?: string;
    description?: string;
    content?: string;
    slug?: string;
  };
  provider?: AIProvider;
  apiKey?: string;
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      system,
      pageContext,
      provider = "intern", // 默认使用书生模型
      apiKey,
    }: ChatRequest = await req.json();

    // 对指定Provider验证key是否存在
    if (requiresApiKey(provider) && (!apiKey || apiKey.trim() === "")) {
      return Response.json(
        {
          error:
            "API key is required. Please configure your API key in the settings.",
        },
        { status: 400 },
      );
    }

    // 构建系统消息，包含页面上下文
    const systemMessage = buildSystemMessage(system, pageContext);

    // 根据Provider获取 AI 模型实例
    const model = getModel(provider, apiKey);

    // 生成流式响应
    const result = streamText({
      model: model,
      system: systemMessage,
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    // 处理特定模型创建错误
    if (error instanceof Error && error.message.includes("API key")) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
