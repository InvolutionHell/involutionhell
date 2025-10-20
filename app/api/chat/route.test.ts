import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { streamText } from "ai";
import { getModel } from "@/lib/ai/models";

// Mock the dependencies
vi.mock("@/lib/ai/models", () => ({
  getModel: vi.fn(),
  requiresApiKey: vi.fn((provider) => provider !== "intern"),
}));

vi.mock("@/lib/ai/prompt", () => ({
  buildSystemMessage: vi.fn((system, pageContext) => {
    return system || "You are a helpful AI assistant.";
  }),
}));

vi.mock("ai", () => ({
  streamText: vi.fn(),
  convertToModelMessages: vi.fn((messages) => messages),
  UIMessage: {},
}));

describe("chat API route", () => {
  const mockStreamText = vi.mocked(streamText);
  const mockGetModel = vi.mocked(getModel);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when API key is missing for openai", async () => {
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        provider: "openai",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("API key is required");
  });

  it("should return error when API key is empty string for gemini", async () => {
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        provider: "gemini",
        apiKey: "",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("API key is required");
  });

  it("should use intern provider by default", async () => {
    const mockModel = { id: "intern-model" } as any;
    mockGetModel.mockReturnValue(mockModel);

    const mockStreamResponse = {
      toUIMessageStreamResponse: vi.fn(() => new Response()),
    } as any;
    mockStreamText.mockReturnValue(mockStreamResponse);

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    await POST(request);

    expect(mockGetModel).toHaveBeenCalledWith("intern", undefined);
    expect(mockStreamText).toHaveBeenCalledWith({
      model: mockModel,
      system: expect.stringContaining("You are a helpful AI assistant"),
      messages: [{ role: "user", content: "Hello" }],
    });
  });

  it("should use OpenAI provider when specified", async () => {
    const mockModel = { id: "openai-model" } as any;
    mockGetModel.mockReturnValue(mockModel);

    const mockStreamResponse = {
      toUIMessageStreamResponse: vi.fn(() => new Response()),
    } as any;
    mockStreamText.mockReturnValue(mockStreamResponse);

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        provider: "openai",
        apiKey: "test-api-key",
      }),
    });

    await POST(request);

    expect(mockGetModel).toHaveBeenCalledWith("openai", "test-api-key");
  });

  it("should include page context in system message", async () => {
    const mockModel = { id: "test-model" } as any;
    mockGetModel.mockReturnValue(mockModel);

    const mockStreamResponse = {
      toUIMessageStreamResponse: vi.fn(() => new Response()),
    } as any;
    mockStreamText.mockReturnValue(mockStreamResponse);

    const pageContext = {
      title: "Test Page",
      description: "A test page",
      content: "Page content here",
      slug: "test-page",
    };

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        pageContext,
      }),
    });

    await POST(request);

    const { buildSystemMessage } = await import("@/lib/ai/prompt");
    expect(buildSystemMessage).toHaveBeenCalledWith(undefined, pageContext);
  });

  it("should use custom system message when provided", async () => {
    const mockModel = { id: "test-model" } as any;
    mockGetModel.mockReturnValue(mockModel);

    const mockStreamResponse = {
      toUIMessageStreamResponse: vi.fn(() => new Response()),
    } as any;
    mockStreamText.mockReturnValue(mockStreamResponse);

    const customSystem = "You are a specialized AI assistant.";

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        system: customSystem,
      }),
    });

    await POST(request);

    const { buildSystemMessage } = await import("@/lib/ai/prompt");
    expect(buildSystemMessage).toHaveBeenCalledWith(customSystem, undefined);
  });

  it("should handle API errors gracefully", async () => {
    const mockModel = { id: "test-model" } as any;
    mockGetModel.mockReturnValue(mockModel);

    mockStreamText.mockImplementation(() => {
      throw new Error("Stream failed");
    });

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to process chat request" });
  });

  it("should handle getModel API key errors", async () => {
    mockGetModel.mockImplementation(() => {
      throw new Error("OpenAI API key is required");
    });

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        provider: "openai",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      "API key is required. Please configure your API key in the settings.",
    );
  });
});
