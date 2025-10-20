import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildDocsEditUrl,
  buildDocsNewUrl,
  normalizeDocsPath,
  githubConstants,
  getContributors,
} from "./github";

describe("github utilities", () => {
  describe("buildDocsEditUrl", () => {
    it("should build correct edit URL for simple path", () => {
      const result = buildDocsEditUrl("ai/llm-basics/index.mdx");
      expect(result).toBe(
        "https://github.com/InvolutionHell/involutionhell.github.io/edit/main/app/docs/ai/llm-basics/index.mdx",
      );
    });

    it("should handle paths with Chinese characters", () => {
      const result = buildDocsEditUrl("ai/基础知识/入门.mdx");
      expect(result).toBe(
        "https://github.com/InvolutionHell/involutionhell.github.io/edit/main/app/docs/ai/%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86/%E5%85%A5%E9%97%A8.mdx",
      );
    });

    it("should handle paths with spaces", () => {
      const result = buildDocsEditUrl("ai/machine learning/deep learning.mdx");
      expect(result).toBe(
        "https://github.com/InvolutionHell/involutionhell.github.io/edit/main/app/docs/ai/machine%20learning/deep%20learning.mdx",
      );
    });

    it("should handle empty path", () => {
      const result = buildDocsEditUrl("");
      expect(result).toBe(
        "https://github.com/InvolutionHell/involutionhell.github.io/edit/main/app/docs",
      );
    });

    it("should clean up multiple slashes", () => {
      const result = buildDocsEditUrl("ai//llm-basics///index.mdx");
      expect(result).toBe(
        "https://github.com/InvolutionHell/involutionhell.github.io/edit/main/app/docs/ai/llm-basics/index.mdx",
      );
    });

    it("should remove leading and trailing slashes", () => {
      const result = buildDocsEditUrl("/ai/llm-basics/index.mdx/");
      expect(result).toBe(
        "https://github.com/InvolutionHell/involutionhell.github.io/edit/main/app/docs/ai/llm-basics/index.mdx",
      );
    });
  });

  describe("buildDocsNewUrl", () => {
    it("should build correct new file URL with params", () => {
      const params = new URLSearchParams({
        filename: "new-doc.mdx",
        value: "---\ntitle: New Doc\n---\n\nContent",
      });
      const result = buildDocsNewUrl("ai/llm-basics", params);
      expect(result).toBe(
        "https://github.com/InvolutionHell/involutionhell.github.io/new/main/app/docs/ai/llm-basics?filename=new-doc.mdx&value=---%0Atitle%3A+New+Doc%0A---%0A%0AContent",
      );
    });

    it("should handle empty params", () => {
      const params = new URLSearchParams();
      const result = buildDocsNewUrl("ai/llm-basics", params);
      expect(result).toBe(
        "https://github.com/InvolutionHell/involutionhell.github.io/new/main/app/docs/ai/llm-basics",
      );
    });

    it("should encode directory path with special characters", () => {
      const params = new URLSearchParams({ filename: "test.mdx" });
      const result = buildDocsNewUrl("ai/机器学习", params);
      expect(result).toBe(
        "https://github.com/InvolutionHell/involutionhell.github.io/new/main/app/docs/ai/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0?filename=test.mdx",
      );
    });
  });

  describe("normalizeDocsPath", () => {
    it("should normalize simple path", () => {
      const result = normalizeDocsPath("ai/llm-basics/index.mdx");
      expect(result).toBe("app/docs/ai/llm-basics/index.mdx");
    });

    it("should handle empty path", () => {
      const result = normalizeDocsPath("");
      expect(result).toBe("app/docs");
    });

    it("should clean up multiple slashes", () => {
      const result = normalizeDocsPath("ai//llm-basics///index.mdx");
      expect(result).toBe("app/docs/ai/llm-basics/index.mdx");
    });

    it("should not encode special characters", () => {
      const result = normalizeDocsPath("ai/基础知识/入门.mdx");
      expect(result).toBe("app/docs/ai/基础知识/入门.mdx");
    });
  });

  describe("githubConstants", () => {
    it("should export correct constants", () => {
      expect(githubConstants).toEqual({
        owner: "InvolutionHell",
        repo: "involutionhell.github.io",
        defaultBranch: "main",
        docsBase: "app/docs",
        repoBaseUrl:
          "https://github.com/InvolutionHell/involutionhell.github.io",
      });
    });
  });

  describe("getContributors", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      global.fetch = vi.fn();
    });

    it("should fetch and return unique contributors", async () => {
      const mockCommits = [
        {
          author: {
            login: "user1",
            avatar_url: "https://avatars.githubusercontent.com/u/1",
            html_url: "https://github.com/user1",
          },
        },
        {
          author: {
            login: "user2",
            avatar_url: "https://avatars.githubusercontent.com/u/2",
            html_url: "https://github.com/user2",
          },
        },
        {
          author: {
            login: "user1", // Duplicate
            avatar_url: "https://avatars.githubusercontent.com/u/1",
            html_url: "https://github.com/user1",
          },
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockCommits,
      } as Response);

      const result = await getContributors("app/docs/test.mdx");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.github.com/repos/InvolutionHell/involutionhell.github.io/commits?path=app/docs/test.mdx",
        expect.objectContaining({
          headers: {},
          next: { revalidate: 3600 },
        }),
      );

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {
          login: "user1",
          avatar_url: "https://avatars.githubusercontent.com/u/1",
          html_url: "https://github.com/user1",
        },
        {
          login: "user2",
          avatar_url: "https://avatars.githubusercontent.com/u/2",
          html_url: "https://github.com/user2",
        },
      ]);
    });

    it("should use GitHub token when available", async () => {
      process.env.GITHUB_TOKEN = "test-token";

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      await getContributors("test.mdx");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: "token test-token",
          },
        }),
      );

      delete process.env.GITHUB_TOKEN;
    });

    it("should handle API errors gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      global.fetch.mockResolvedValue({
        ok: false,
        statusText: "Rate limit exceeded",
      } as Response);

      const result = await getContributors("test.mdx");

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch contributors for test.mdx: Rate limit exceeded",
      );

      consoleSpy.mockRestore();
    });

    it("should handle network errors gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      global.fetch.mockRejectedValue(new Error("Network error"));

      const result = await getContributors("test.mdx");

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching contributors for test.mdx:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle commits without author", async () => {
      const mockCommits = [
        {
          author: {
            login: "user1",
            avatar_url: "https://avatars.githubusercontent.com/u/1",
            html_url: "https://github.com/user1",
          },
        },
        {
          // No author field
        },
        {
          author: null,
        },
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockCommits,
      } as Response);

      const result = await getContributors("test.mdx");

      expect(result).toHaveLength(1);
      expect(result[0].login).toBe("user1");
    });
  });
});
