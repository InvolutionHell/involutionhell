import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  AssistantSettingsProvider,
  useAssistantSettings,
} from "./useAssistantSettings";

describe("useAssistantSettings", () => {
  const mockLocalStorage = vi.mocked(global.localStorage);

  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AssistantSettingsProvider>{children}</AssistantSettingsProvider>
  );

  it("should throw error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAssistantSettings());
    }).toThrow(
      "useAssistantSettings must be used within an AssistantSettingsProvider",
    );

    consoleSpy.mockRestore();
  });

  it("should initialize with default settings", () => {
    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    expect(result.current.provider).toBe("openai");
    expect(result.current.openaiApiKey).toBe("");
    expect(result.current.geminiApiKey).toBe("");
  });

  it("should load settings from localStorage", () => {
    const savedSettings = {
      provider: "gemini",
      openaiApiKey: "test-openai-key",
      geminiApiKey: "test-gemini-key",
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings));

    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    expect(result.current.provider).toBe("gemini");
    expect(result.current.openaiApiKey).toBe("test-openai-key");
    expect(result.current.geminiApiKey).toBe("test-gemini-key");
  });

  it("should handle invalid localStorage data gracefully", () => {
    mockLocalStorage.getItem.mockReturnValue("invalid json");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    expect(result.current.provider).toBe("openai");
    expect(result.current.openaiApiKey).toBe("");
    expect(result.current.geminiApiKey).toBe("");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to parse assistant settings from localStorage",
      expect.any(SyntaxError),
    );

    consoleSpy.mockRestore();
  });

  it("should update provider and save to localStorage", () => {
    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    act(() => {
      result.current.setProvider("gemini");
    });

    expect(result.current.provider).toBe("gemini");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "assistant-settings-storage",
      expect.stringContaining('"provider":"gemini"'),
    );
  });

  it("should update openaiApiKey and save to localStorage", () => {
    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    act(() => {
      result.current.setOpenaiApiKey("new-openai-key");
    });

    expect(result.current.openaiApiKey).toBe("new-openai-key");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "assistant-settings-storage",
      expect.stringContaining('"openaiApiKey":"new-openai-key"'),
    );
  });

  it("should update geminiApiKey and save to localStorage", () => {
    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    act(() => {
      result.current.setGeminiApiKey("new-gemini-key");
    });

    expect(result.current.geminiApiKey).toBe("new-gemini-key");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "assistant-settings-storage",
      expect.stringContaining('"geminiApiKey":"new-gemini-key"'),
    );
  });

  it("should handle localStorage save errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    act(() => {
      result.current.setProvider("gemini");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to save assistant settings to localStorage",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("should refresh settings from storage", () => {
    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    // Change settings
    act(() => {
      result.current.setProvider("gemini");
    });

    // Mock new data in localStorage
    const newSettings = {
      provider: "openai",
      openaiApiKey: "refreshed-key",
      geminiApiKey: "",
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(newSettings));

    // Refresh from storage
    act(() => {
      result.current.refreshFromStorage();
    });

    expect(result.current.provider).toBe("openai");
    expect(result.current.openaiApiKey).toBe("refreshed-key");
  });

  it("should handle storage events from other tabs", () => {
    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    const newSettings = {
      provider: "gemini",
      openaiApiKey: "",
      geminiApiKey: "external-change",
    };

    // Simulate storage event from another tab
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "assistant-settings-storage",
        newValue: JSON.stringify(newSettings),
        oldValue: null,
        storageArea: window.localStorage,
        url: window.location.href,
      });
      window.dispatchEvent(storageEvent);
    });

    expect(result.current.provider).toBe("gemini");
    expect(result.current.geminiApiKey).toBe("external-change");
  });

  it("should ignore storage events for other keys", () => {
    const { result } = renderHook(() => useAssistantSettings(), { wrapper });
    const initialProvider = result.current.provider;

    // Simulate storage event for different key
    act(() => {
      const storageEvent = new StorageEvent("storage", {
        key: "other-key",
        newValue: "some value",
        oldValue: null,
        storageArea: window.localStorage,
        url: window.location.href,
      });
      window.dispatchEvent(storageEvent);
    });

    expect(result.current.provider).toBe(initialProvider);
  });

  it("should validate provider values from localStorage", () => {
    const invalidSettings = {
      provider: "invalid-provider",
      openaiApiKey: "key",
      geminiApiKey: "",
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(invalidSettings));

    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    // Should default to 'openai' for invalid provider
    expect(result.current.provider).toBe("openai");
  });

  it("should handle missing fields in localStorage gracefully", () => {
    const partialSettings = {
      provider: "gemini",
      // Missing API keys
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialSettings));

    const { result } = renderHook(() => useAssistantSettings(), { wrapper });

    expect(result.current.provider).toBe("gemini");
    expect(result.current.openaiApiKey).toBe("");
    expect(result.current.geminiApiKey).toBe("");
  });
});
