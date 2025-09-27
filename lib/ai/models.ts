import { createOpenAIModel } from "./providers/openai";
import { createGeminiModel } from "./providers/gemini";
import { createInternModel } from "./providers/intern";

export type AIProvider = "openai" | "gemini" | "intern";

/**
 * Model工厂 用于返回对应的 AI 模型实例
 * @param provider - 要用的provider
 * @param apiKey - API key (intern provider不需要用户提供 API key)
 * @returns 配置好的 AI 模型实例
 */
export function getModel(provider: AIProvider, apiKey?: string) {
  switch (provider) {
    case "openai":
      if (!apiKey || apiKey.trim() === "") {
        throw new Error("OpenAI API key is required");
      }
      return createOpenAIModel(apiKey);

    case "gemini":
      if (!apiKey || apiKey.trim() === "") {
        throw new Error("Gemini API key is required");
      }
      return createGeminiModel(apiKey);

    case "intern":
      // Intern 书生模型不需要用户提供 API key
      return createInternModel();

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * 检查指定的提供者是否需要用户提供 API key
 * @param provider - 要检查的provider
 * @returns 如果需要 API key，返回 true，否则返回 false
 */
export function requiresApiKey(provider: AIProvider): boolean {
  return provider !== "intern";
}
