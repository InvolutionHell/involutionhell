// eslint.config.mjs  ← 推荐直接改成 .mjs，或在 package.json 加 "type":"module"
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
// 可选：自动删除无用 import
import unusedImports from "eslint-plugin-unused-imports";

export default [
  // 忽略目录（取代 .eslintignore）
  {
    ignores: [
      ".source/**",
      ".contentlayer/**",
      ".cursor/**",
      ".vscode/**",
      ".idea/**",
      ".husky/**",
      "**/node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "public/**",
      "generated/**", // 忽略生成代码（你的 Prisma/wasm 都在这）
      "**/*.min.js",
    ],
  },

  // 通用 JS/TS
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // 自动删除无用 import & 变量（变量使用 _ 前缀可豁免）
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },

  // TypeScript 规则
  ...tseslint.config({
    files: ["**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // 允许你在个别地方保留 @ts-expect-error，但不允许 @ts-nocheck
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": "allow-with-description", "ts-nocheck": true },
      ],
    },
  }),

  // 单文件豁免：Next 自动生成的 d.ts
  {
    files: ["next-env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
];
