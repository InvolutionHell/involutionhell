import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge single class string", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("should merge multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
  });

  it("should handle undefined and null values", () => {
    expect(cn("foo", undefined, "bar", null, "baz")).toBe("foo bar baz");
  });

  it("should handle object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("should handle array syntax", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
  });

  it("should merge tailwind classes correctly", () => {
    // twMerge should handle conflicting classes
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should preserve non-conflicting tailwind classes", () => {
    expect(cn("p-4 text-red-500", "mx-2")).toBe("p-4 text-red-500 mx-2");
  });

  it("should handle complex tailwind modifiers", () => {
    expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe(
      "hover:bg-blue-500",
    );
    expect(cn("sm:p-4", "lg:p-8")).toBe("sm:p-4 lg:p-8");
  });

  it("should handle mixed inputs", () => {
    expect(
      cn(
        "base-class",
        { active: true, disabled: false },
        ["array-class-1", "array-class-2"],
        undefined,
        "final-class",
      ),
    ).toBe("base-class active array-class-1 array-class-2 final-class");
  });

  it("should handle complex conditional rendering patterns", () => {
    const isActive = true;
    const isDisabled = false;
    const size = "lg";

    expect(
      cn(
        "btn",
        isActive && "btn-active",
        isDisabled && "btn-disabled",
        size === "lg" && "btn-lg",
        size === "sm" && "btn-sm",
      ),
    ).toBe("btn btn-active btn-lg");
  });

  it("should handle duplicate classes", () => {
    // Note: cn doesn't deduplicate classes by default - that's expected behavior
    expect(cn("foo foo bar", "bar baz")).toBe("foo foo bar bar baz");
  });

  it("should handle numeric values", () => {
    // clsx converts numbers to strings
    expect(cn("gap-", 4 as unknown as string)).toBe("gap- 4");
  });

  it("should handle Tailwind arbitrary values", () => {
    expect(cn("w-[100px]", "w-[200px]")).toBe("w-[200px]");
    expect(cn("text-[#123456]", "text-[#789abc]")).toBe("text-[#789abc]");
  });

  it("should handle important modifiers", () => {
    // twMerge preserves order - important modifier comes first
    expect(cn("!p-4", "p-8")).toBe("!p-4 p-8");
  });

  it("should handle responsive breakpoints correctly", () => {
    expect(cn("text-sm md:text-base lg:text-lg", "md:text-xl")).toBe(
      "text-sm lg:text-lg md:text-xl",
    );
  });

  it("should handle deeply nested arrays", () => {
    expect(cn(["foo", ["bar", ["baz"]]])).toBe("foo bar baz");
  });

  it("should return empty string for all falsy inputs", () => {
    expect(cn(false, null, undefined, "", 0 as unknown as string)).toBe("");
  });
});
