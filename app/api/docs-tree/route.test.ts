/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const mockPath = vi.mocked(path);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.cwd mock
    vi.spyOn(process, "cwd").mockReturnValue("/test/project");
    // Setup default path mocks
    mockPath.resolve.mockImplementation((...args) => args.join("/"));
    mockPath.join.mockImplementation((...args) => args.join("/"));
  });

  it("should return error when fs is not available", async () => {
    // Save original functions
    const originalReaddirSync = mockFs.readdirSync;
    const originalExistsSync = mockFs.existsSync;

    // Mock fs functions to be undefined
    (mockFs as any).readdirSync = undefined;
    (mockFs as any).existsSync = undefined;

    const response = await GET();
    const data = await response.json();

    // Restore original functions
    mockFs.readdirSync = originalReaddirSync;
    mockFs.existsSync = originalExistsSync;

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.reason).toBe("fs-unavailable");
    expect(data.diag.hasFs).toBe(false);
  });

  it("should return error when docs root is not found", async () => {
    mockFs.readdirSync.mockImplementation((() => []) as any);
    mockFs.existsSync.mockReturnValue(false);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.reason).toBe("docs-root-not-found");
  });

  it("should build correct tree structure", async () => {
    const mockDirents = [
      { name: "ai", isDirectory: () => true },
      { name: "frontend", isDirectory: () => true },
      { name: "index.mdx", isDirectory: () => false },
    ];

    const mockAiSubdirs = [
      { name: "llm-basics", isDirectory: () => true },
      { name: "multimodal", isDirectory: () => true },
      { name: "index.mdx", isDirectory: () => false },
    ];

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockImplementation(((dir: any, options: any) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        // Return dirent objects for directories
        if (dir === "/test/project/app/docs") return mockDirents;
        if (dir === "/test/project/app/docs/ai") return mockAiSubdirs;
        if (dir === "/test/project/app/docs/frontend") return [];
        return [];
      }
      // Otherwise return string array
      return [];
    }) as any);

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

  it("should handle missing docs directory gracefully", async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockImplementation((() => {
      throw new Error("Permission denied");
    }) as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.error).toContain("Permission denied");
  });

  it("should handle empty docs directory", async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockImplementation((() => {
      return [];
    }) as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.tree).toEqual([]);
  });

  it("should filter out files and only include directories", async () => {
    const mockDirents = [
      { name: "folder1", isDirectory: () => true },
      { name: "file1.mdx", isDirectory: () => false },
      { name: "folder2", isDirectory: () => true },
      { name: "README.md", isDirectory: () => false },
    ];

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockImplementation(((dir: any, options: any) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        return mockDirents;
      }
      return [];
    }) as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tree).toHaveLength(2);
    expect(data.tree.map((item: any) => item.name)).toEqual([
      "folder1",
      "folder2",
    ]);
  });

  it("should handle nested directory structure", async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockImplementation(((dir: any, options: any) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        if (dir === "/test/project/app/docs") {
          return [{ name: "parent", isDirectory: () => true }];
        }
        if (dir === "/test/project/app/docs/parent") {
          return [{ name: "child", isDirectory: () => true }];
        }
        if (dir === "/test/project/app/docs/parent/child") {
          return [{ name: "grandchild", isDirectory: () => true }];
        }
      }
      return [];
    }) as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tree[0]).toEqual({
      name: "parent",
      path: "parent",
      children: [
        {
          name: "child",
          path: "parent/child",
        },
      ],
    });
  });

  it("should handle process.cwd errors", async () => {
    vi.spyOn(process, "cwd").mockImplementation(() => {
      throw new Error("Cannot determine cwd");
    });

    await expect(GET()).rejects.toThrow("Cannot determine cwd");
  });

  it("should handle different OS path separators", async () => {
    // Setup for Windows-style paths
    vi.spyOn(process, "cwd").mockReturnValue("C:\\test\\project");
    mockPath.resolve.mockImplementation((...args) => args.join("\\"));
    mockPath.join.mockImplementation((...args) => args.join("\\"));

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockImplementation(((dir: any, options: any) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        return [{ name: "test-folder", isDirectory: () => true }];
      }
      return [];
    }) as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("should limit recursion depth", async () => {
    // This test ensures we don't have infinite recursion
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockImplementation(((dir: any, options: any) => {
      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        // Create a structure that's deeper than maxDepth
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
    }) as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    // Verify that level3 is not included due to maxDepth=2
    expect(data.tree[0].children[0]).toEqual({
      name: "level2",
      path: "level1/level2",
    });
  });
});
