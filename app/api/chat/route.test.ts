import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Mock the AI SDKs
vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(),
}));

vi.mock("ai", () => ({
  streamText: vi.fn(),
  convertToModelMessages: vi.fn((messages) => messages),
  UIMessage: {},
}));

describe("chat API route", () => {
  const mockStreamText = vi.mocked(streamText);
  const mockCreateOpenAI = vi.mocked(createOpenAI);
  const mockCreateGoogleGenerativeAI = vi.mocked(createGoogleGenerativeAI);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when API key is missing", async () => {
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

  it("should return error when API key is empty string", async () => {
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        provider: "openai",
        apiKey: "   ",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(
      "API key is required. Please configure your API key in the settings.",
    );
  });

  it("should use OpenAI provider by default", async () => {
    const mockModel = vi.fn();
    const mockOpenAIInstance = vi.fn(() => mockModel);
    mockCreateOpenAI.mockReturnValue(mockOpenAIInstance);

    const mockStreamResponse = {
      toUIMessageStreamResponse: vi.fn(() => new Response()),
    };
    mockStreamText.mockReturnValue(mockStreamResponse);

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        apiKey: "test-api-key",
      }),
    });

    await POST(request);

    expect(mockCreateOpenAI).toHaveBeenCalledWith({
      apiKey: "test-api-key",
    });
    expect(mockOpenAIInstance).toHaveBeenCalledWith("gpt-4.1-nano");
    expect(mockStreamText).toHaveBeenCalledWith({
      model: mockModel,
      system: expect.stringContaining("You are a helpful AI assistant"),
      messages: [{ role: "user", content: "Hello" }],
    });
  });

  it("should use Gemini provider when specified", async () => {
    const mockModel = vi.fn();
    const mockGeminiInstance = vi.fn(() => mockModel);
    mockCreateGoogleGenerativeAI.mockReturnValue(mockGeminiInstance);

    const mockStreamResponse = {
      toUIMessageStreamResponse: vi.fn(() => new Response()),
    };
    mockStreamText.mockReturnValue(mockStreamResponse);

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        provider: "gemini",
        apiKey: "test-gemini-key",
      }),
    });

    await POST(request);

    expect(mockCreateGoogleGenerativeAI).toHaveBeenCalledWith({
      apiKey: "test-gemini-key",
    });
    expect(mockGeminiInstance).toHaveBeenCalledWith("models/gemini-2.0-flash");
  });

  it("should include page context in system message", async () => {
    const mockModel = vi.fn();
    const mockOpenAIInstance = vi.fn(() => mockModel);
    mockCreateOpenAI.mockReturnValue(mockOpenAIInstance);

    const mockStreamResponse = {
      toUIMessageStreamResponse: vi.fn(() => new Response()),
    };
    mockStreamText.mockReturnValue(mockStreamResponse);

    const pageContext = {
      title: "Test Page",
      description: "Test Description",
      content: "Page content here",
      slug: "test-page",
    };

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Tell me about this page" }],
        apiKey: "test-api-key",
        pageContext,
      }),
    });

    await POST(request);

    expect(mockStreamText).toHaveBeenCalledWith({
      model: expect.anything(),
      system: expect.stringContaining("Page Title: Test Page"),
      messages: expect.anything(),
    });

    const systemMessage = mockStreamText.mock.calls[0][0].system;
    expect(systemMessage).toContain("Page Description: Test Description");
    expect(systemMessage).toContain("Page URL: /docs/test-page");
    expect(systemMessage).toContain("Page Content:\nPage content here");
  });

  it("should use custom system message when provided", async () => {
    const mockModel = vi.fn();
    const mockOpenAIInstance = vi.fn(() => mockModel);
    mockCreateOpenAI.mockReturnValue(mockOpenAIInstance);

    const mockStreamResponse = {
      toUIMessageStreamResponse: vi.fn(() => new Response()),
    };
    mockStreamText.mockReturnValue(mockStreamResponse);

    const customSystem = "You are a specialized assistant for coding tasks.";

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Help me code" }],
        apiKey: "test-api-key",
        system: customSystem,
      }),
    });

    await POST(request);

    expect(mockStreamText).toHaveBeenCalledWith({
      model: expect.anything(),
      system: customSystem,
      messages: expect.anything(),
    });
  });

  it("should handle API errors gracefully", async () => {
    const mockOpenAIInstance = vi.fn(() => {
      throw new Error("API Error");
    });
    mockCreateOpenAI.mockReturnValue(mockOpenAIInstance);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        apiKey: "test-api-key",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to process chat request");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Chat API error:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("should handle partial page context", async () => {
    const mockModel = vi.fn();
    const mockOpenAIInstance = vi.fn(() => mockModel);
    mockCreateOpenAI.mockReturnValue(mockOpenAIInstance);

    const mockStreamResponse = {
      toUIMessageStreamResponse: vi.fn(() => new Response()),
    };
    mockStreamText.mockReturnValue(mockStreamResponse);

    const pageContext = {
      title: "Test Page",
      content: "Page content here",
      // Missing description and slug
    };

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Tell me about this page" }],
        apiKey: "test-api-key",
        pageContext,
      }),
    });

    await POST(request);

    const systemMessage = mockStreamText.mock.calls[0][0].system;
    expect(systemMessage).toContain("Page Title: Test Page");
    expect(systemMessage).toContain("Page Content:\nPage content here");
    expect(systemMessage).not.toContain("Page Description:");
    expect(systemMessage).not.toContain("Page URL:");
  });

  // Note: Testing maxDuration export directly would require dynamic imports
  // which don't work well with vitest mocking. The maxDuration is set to 30
  // in the route file and this is verified by the actual behavior during runtime.
});
