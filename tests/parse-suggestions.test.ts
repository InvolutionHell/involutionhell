import { describe, expect, it } from "vitest";

import { parseSuggestionJson } from "@/lib/ai/parse-suggestions";

describe("parseSuggestionJson", () => {
  it("解析标准 JSON 数组", () => {
    expect(
      parseSuggestionJson('[{"title":"a","label":"b","action":"c"}]'),
    ).toEqual([{ title: "a", label: "b", action: "c" }]);
  });

  it("剥掉 markdown 代码块和前缀文本", () => {
    expect(
      parseSuggestionJson('好的：\n```json\n[{"title":"a"}]\n```'),
    ).toEqual([{ title: "a" }]);
  });

  it("中文引号 + 字段间全角逗号", () => {
    const raw = `[
    {"title":"基础概念”，“label":"基础知识”，“action":"请解释一下计算机科学中的基本概念是什么？"},
    {"title":"算法分析”，“label":"算法复杂度”，“action":"如何分析算法的时间复杂度和空间复杂度？"}
]`;
    expect(parseSuggestionJson(raw)).toEqual([
      {
        title: "基础概念",
        label: "基础知识",
        action: "请解释一下计算机科学中的基本概念是什么？",
      },
      {
        title: "算法分析",
        label: "算法复杂度",
        action: "如何分析算法的时间复杂度和空间复杂度？",
      },
    ]);
  });

  it("对象间全角逗号", () => {
    expect(parseSuggestionJson('[{"title":"a"}，{"title":"b"}]')).toEqual([
      { title: "a" },
      { title: "b" },
    ]);
  });

  it("值内部的全角逗号保持不变", () => {
    expect(parseSuggestionJson('[{"action":"先读题，再写码"}]')).toEqual([
      { action: "先读题，再写码" },
    ]);
  });

  it("key 后全角冒号", () => {
    expect(parseSuggestionJson('[{"title"："a"}]')).toEqual([{ title: "a" }]);
  });

  it("完全无法解析时抛错", () => {
    expect(() => parseSuggestionJson("没有任何 JSON")).toThrow();
  });
});
