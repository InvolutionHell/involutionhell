import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

/**
 * CRITICAL: 覆盖默认的 img 组件映射
 *
 * 为什么不使用 Next.js Image 组件：
 *
 * 1. Vercel 配额限制
 *    - 网站部署在 Vercel 上，Next.js Image 优化需要消耗配额
 *    - Vercel 免费计划已耗尽配额，因此禁用了 Next.js Image 优化
 *
 * 2. 构建和运行时问题
 *    - fumadocs-ui 的默认 MDX 组件将 <img> 映射到 Next.js Image 组件
 *    - Next.js Image 强制要求 width/height 属性
 *    - 我们禁用了远程尺寸探测 (source.config.ts: external: false)
 *    - 导致运行时报错: "Image with src ... is missing required width property"
 *
 * 3. 解决方案
 *    - 使用原生 <img> 标签替代 Next.js Image 组件
 *    - 保持浏览器原生的图片加载行为
 *    - 避免 width/height 要求，兼容编辑器生成和用户投稿
 *
 * 相关配置：
 * - next.config.mjs: unoptimized: true（禁用 Next.js 图片优化）
 * - source.config.ts: external: false（禁用远程尺寸探测）
 * - 本文件: img: 原生标签（避免 Next.js Image 组件）
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // 覆盖默认的 img 映射，使用原生 <img> 标签而不是 Next.js Image 组件
    // 本地相对路径图片会被 remark-image 编译成静态 import，src 是
    // StaticImageData 对象而不是字符串，直接透传会渲染成 "[object Object]"
    img: ({ src, ...props }) => {
      const resolved =
        src && typeof src === "object" && "src" in src
          ? (src as { src: string }).src
          : src;
      return (
        // images.unoptimized=true，next/image 不会带来优化，见文件头注释
        // eslint-disable-next-line @next/next/no-img-element
        <img
          loading="lazy"
          decoding="async"
          {...props}
          src={resolved}
          alt={props.alt || ""}
        />
      );
    },
    ...components,
  };
}
