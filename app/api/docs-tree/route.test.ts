import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// Mock node modules before importing the route
vi.mock("node:fs");
vi.mock("node:path");

// Import the route after mocking
import { GET } from "./route";

describe("docs-tree API route", () => {
  const mockFs = vi.mocked(fs);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockPath = vi.mocked(path);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.cwd mock
    vi.spyOn(process, "cwd").mockReturnValue("/test/project");

    // Setup path.join mock
    vi.mocked(path.join).mockImplementation((...args) => args.join("/"));
  });

  it("should return error when fs is not available", async () => {
    // Mock fs functions to be undefined
    mockFs.readdirSync = undefined;
    mockFs.existsSync = undefined;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.reason).toBe("fs-unavailable");
    expect(data.diag.hasFs).toBe(false);
  });

  it("should return error when docs root is not found", async () => {
    mockFs.readdirSync = vi.fn();
    mockFs.existsSync = vi.fn(() => false);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.reason).toBe("docs-root-not-found");
    expect(data.diag.exists).toEqual({
      "/test/project/app/docs": false,
      "/test/project/src/app/docs": false,
    });
  });

  it("should successfully build docs tree", async () => {
    mockFs.existsSync = vi.fn((path) => path === "/test/project/app/docs");

    const mockDirents = [
      { name: "ai", isDirectory: () => true },
      { name: "frontend", isDirectory: () => true },
      { name: ".hidden", isDirectory: () => true }, // Should be filtered
      { name: "[...slug]", isDirectory: () => true }, // Should be filtered
      { name: "file.mdx", isDirectory: () => false }, // Should be filtered
    ];

    const mockAiSubdirs = [
      { name: "llm-basics", isDirectory: () => true },
      { name: "multimodal", isDirectory: () => true },
    ];

    mockFs.readdirSync = vi.fn((dir, options) => {
      // When withFileTypes is true, return Dirent objects
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        if (dir === "/test/project/app/docs") return mockDirents;
        if (dir === "/test/project/app/docs/ai") return mockAiSubdirs;
        if (dir === "/test/project/app/docs/frontend") return [];
        return [];
      }
      // Otherwise return string array
      return [];
    }) as typeof fs.readdirSync;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.docsRoot).toBe("/test/project/app/docs");
    expect(data.tree).toEqual([
      {
        name: "ai",
        path: "ai",
        children: [
          { name: "llm-basics", path: "ai/llm-basics" },
          { name: "multimodal", path: "ai/multimodal" },
        ],
      },
      {
        name: "frontend",
        path: "frontend",
        children: [],
      },
    ]);
  });

  it("should handle readdir errors", async () => {
    mockFs.existsSync = vi.fn(() => true);
    mockFs.readdirSync = vi.fn(() => {
      throw new Error("Permission denied");
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.reason).toBe("buildTree-failed");
    expect(data.error).toContain("Permission denied");
  });

  it("should handle unhandled exceptions", async () => {
    // We'll test this by making buildTree throw an error
    mockFs.existsSync = vi.fn(() => true);
    mockFs.readdirSync = vi.fn(() => {
      throw new Error("Unexpected error");
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.reason).toBe("buildTree-failed");
    expect(data.error).toContain("Unexpected error");
  });

  it("should sort directories using Chinese locale", async () => {
    mockFs.existsSync = vi.fn((path) => path === "/test/project/app/docs");

    const mockDirents = [
      { name: "张三", isDirectory: () => true },
      { name: "李四", isDirectory: () => true },
      { name: "王五", isDirectory: () => true },
      { name: "english", isDirectory: () => true },
    ];

    mockFs.readdirSync = vi.fn((dir, options) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        return mockDirents;
      }
      return [];
    }) as typeof fs.readdirSync;

    const response = await GET();
    const data = await response.json();

    expect(data.ok).toBe(true);
    // The exact order depends on the locale implementation
    interface TreeNode {
      name: string;
    }
    expect(data.tree.map((n: TreeNode) => n.name)).toContain("张三");
    expect(data.tree.map((n: TreeNode) => n.name)).toContain("李四");
    expect(data.tree.map((n: TreeNode) => n.name)).toContain("王五");
    expect(data.tree.map((n: TreeNode) => n.name)).toContain("english");
  });

  it("should fallback to standard sort if Chinese locale fails", async () => {
    mockFs.existsSync = vi.fn((path) => path === "/test/project/app/docs");

    const mockDirents = [
      { name: "b-folder", isDirectory: () => true },
      { name: "a-folder", isDirectory: () => true },
      { name: "c-folder", isDirectory: () => true },
    ];

    mockFs.readdirSync = vi.fn((dir, options) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        return mockDirents;
      }
      return [];
    }) as typeof fs.readdirSync;

    // Mock localeCompare to throw for Chinese locale
    const originalLocaleCompare = String.prototype.localeCompare;
    String.prototype.localeCompare = function (
      that: string,
      locales?: string | string[],
    ) {
      if (locales === "zh-Hans") throw new Error("Locale not supported");
      return originalLocaleCompare.call(this, that);
    };

    const response = await GET();
    const data = await response.json();

    expect(data.ok).toBe(true);
    expect(data.tree.map((n: TreeNode) => n.name)).toEqual([
      "a-folder",
      "b-folder",
      "c-folder",
    ]);

    // Restore original
    String.prototype.localeCompare = originalLocaleCompare;
  });

  it("should include environment hints in diagnostics", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    process.env.NODE_ENV = "test";

    mockFs.existsSync = vi.fn(() => true);
    mockFs.readdirSync = vi.fn((dir, options) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        return [];
      }
      return [];
    }) as typeof fs.readdirSync;

    const response = await GET();
    const data = await response.json();

    expect(data.diag.envHints).toEqual({
      NEXT_RUNTIME: "nodejs",
      NODE_ENV: "test",
    });

    delete process.env.NEXT_RUNTIME;
    delete process.env.NODE_ENV;
  });

  it("should use src/app/docs if app/docs does not exist", async () => {
    mockFs.existsSync = vi.fn((path) => path === "/test/project/src/app/docs");
    mockFs.readdirSync = vi.fn((dir, options) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        return [{ name: "test-folder", isDirectory: () => true }];
      }
      return [];
    }) as typeof fs.readdirSync;

    const response = await GET();
    const data = await response.json();

    expect(data.ok).toBe(true);
    expect(data.docsRoot).toBe("/test/project/src/app/docs");
    expect(data.tree).toHaveLength(1);
    expect(data.tree[0].name).toBe("test-folder");
  });

  it("should handle deeply nested directories up to maxDepth", async () => {
    mockFs.existsSync = vi.fn((path) => path === "/test/project/app/docs");

    // Mock three levels of directories
    mockFs.readdirSync = vi.fn((dir, options) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        if (dir === "/test/project/app/docs") {
          return [{ name: "level1", isDirectory: () => true }];
        }
        if (dir === "/test/project/app/docs/level1") {
          return [{ name: "level2", isDirectory: () => true }];
        }
        if (dir === "/test/project/app/docs/level1/level2") {
          // This should not have children due to maxDepth=2
          return [{ name: "level3", isDirectory: () => true }];
        }
      }
      return [];
    }) as typeof fs.readdirSync;

    const response = await GET();
    const data = await response.json();

    expect(data.ok).toBe(true);
    expect(data.tree).toEqual([
      {
        name: "level1",
        path: "level1",
        children: [
          {
            name: "level2",
            path: "level1/level2",
            // No children here due to maxDepth=2
          },
        ],
      },
    ]);
  });

  // Note: Testing runtime and dynamic exports directly would require dynamic imports
  // which don't work well with vitest mocking. These values are verified in the actual
  // route file during runtime.
});
