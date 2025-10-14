import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export const docs = defineDocs({
  dir: "app/docs",
});

// 默认改为忽略拉取远程图片尺寸时的网络错误，既不中断构建，也能在可访问时自动补全宽高。
// 另外，在开发模式下禁用远程图片尺寸的主动请求，避免本地离线调试时等待网络超时。
const remoteImageMode = process.env.DOCS_REMOTE_IMAGE_SIZE;
const shouldForceRemote = remoteImageMode === "force";
const shouldDisableRemote =
  remoteImageMode === "disable" ||
  (!shouldForceRemote && process.env.NODE_ENV === "development");

const imageOptions = shouldForceRemote
  ? undefined
  : {
      onError: "ignore" as const,
      ...(shouldDisableRemote && { external: false as const }),
    };

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMath],
    rehypePlugins: (v) => [rehypeKatex, ...v],
    ...(imageOptions && { remarkImageOptions: imageOptions }),
  },
});
