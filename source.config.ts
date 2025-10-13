import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export const docs = defineDocs({
  dir: "app/docs",
});

// 默认改为忽略拉取远程图片尺寸时的网络错误，既不中断构建，也能在可访问时自动补全宽高。
const imageOptions =
  process.env.DOCS_REMOTE_IMAGE_SIZE === "force"
    ? undefined
    : { onError: "ignore" as const };

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMath],
    rehypePlugins: (v) => [rehypeKatex, ...v],
    ...(imageOptions && { remarkImageOptions: imageOptions }),
  },
});
