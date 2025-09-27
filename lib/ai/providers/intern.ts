import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Create Intern-AI model instance
 * Uses environment variable INTERN_KEY for API key
 * @returns Configured Intern-AI model instance
 */
export function createInternModel() {
  const intern = createOpenAICompatible({
    name: "intern",
    baseURL: "https://chat.intern-ai.org.cn/api/v1/",
    apiKey: process.env.INTERN_KEY,
  });

  // Use the specific model configured for this project
  return intern("intern-s1");
}
