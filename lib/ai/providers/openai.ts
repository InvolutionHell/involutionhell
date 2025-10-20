import { createOpenAI } from "@ai-sdk/openai";

/**
 * Create OpenAI model instance
 * @param apiKey - OpenAI API key provided by user
 * @returns Configured OpenAI model instance
 */
export function createOpenAIModel(apiKey: string) {
  const customOpenAI = createOpenAI({
    apiKey: apiKey,
  });

  // Use the specific model configured for this project
  return customOpenAI("gpt-4.1-nano");
}
