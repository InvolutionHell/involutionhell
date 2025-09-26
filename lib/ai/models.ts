import { createOpenAIModel } from "./providers/openai";
import { createGeminiModel } from "./providers/gemini";
import { createInternModel } from "./providers/intern";

export type AIProvider = "openai" | "gemini" | "intern";

/**
 * Model factory that returns the appropriate AI model based on provider
 * @param provider - The AI provider to use
 * @param apiKey - API key (not required for intern provider)
 * @returns Configured AI model instance
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
      // Intern provider doesn't need API key from user
      return createInternModel();

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Check if the given provider requires an API key from the user
 * @param provider - The AI provider to check
 * @returns True if API key is required, false otherwise
 */
export function requiresApiKey(provider: AIProvider): boolean {
  return provider !== "intern";
}
