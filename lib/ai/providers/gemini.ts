import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Create Google Gemini model instance
 * @param apiKey - Google Gemini API key provided by user
 * @returns Configured Gemini model instance
 */
export function createGeminiModel(apiKey: string) {
  const customGoogle = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  // Use the specific model configured for this project
  return customGoogle("models/gemini-2.0-flash");
}
