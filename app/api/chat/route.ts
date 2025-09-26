import { streamText, UIMessage, convertToModelMessages } from "ai";
import { getModel, requiresApiKey, type AIProvider } from "@/lib/ai/models";
import { buildSystemMessage } from "@/lib/ai/prompt";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ChatRequest {
  messages: UIMessage[];
  system?: string; // System message forwarded from AssistantChatTransport
  tools?: unknown; // Frontend tools forwarded from AssistantChatTransport
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
      provider = "openai", // Default to OpenAI
      apiKey,
    }: ChatRequest = await req.json();

    // Validate API key for providers that require it
    if (requiresApiKey(provider) && (!apiKey || apiKey.trim() === "")) {
      return Response.json(
        {
          error:
            "API key is required. Please configure your API key in the settings.",
        },
        { status: 400 },
      );
    }

    // Build system message with page context
    const systemMessage = buildSystemMessage(system, pageContext);

    // Get AI model instance based on provider
    const model = getModel(provider, apiKey);

    // Generate streaming response
    const result = streamText({
      model: model,
      system: systemMessage,
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    // Handle specific model creation errors
    if (error instanceof Error && error.message.includes("API key")) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
