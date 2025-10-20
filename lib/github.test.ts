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
});
