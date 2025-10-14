import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/**
 * @description: 定义文档根目录
 * Fumadocs 会从 app/docs 下递归扫描 .mdx 文件，
 * 自动生成 PageTree（用于左侧导航结构）。
 */
export const docs = defineDocs({
  dir: "app/docs",
});

/**
 * Fumadocs 图片尺寸探测逻辑控制
 * @description: Fumadocs 在构建时默认会尝试访问远程图片 (external URLs)
 * 以自动获取 width / height，避免首屏布局抖动。
 *
 * 但问题是：
 * - 在国内网络下访问 GitHub / Unsplash / Vercel CDN 等图床常常超时；
 * - 离线或 VPN 断线时，本地 dev 会卡很久；
 * - 所以我们需要在 dev 或明确指定时禁用远程探测。
 *
 * 可通过环境变量 DOCS_REMOTE_IMAGE_SIZE 控制：
 *   - "force"   → 强制请求远程尺寸，即使失败也抛错；
 *   - "disable" → 完全禁用远程请求，仅依赖手动声明的宽高；
 *   - 未设置    → 在开发环境自动禁用，在生产环境启用（但忽略错误）。
 */
const remoteImageMode = process.env.DOCS_REMOTE_IMAGE_SIZE;

// 是否“强制开启远程尺寸探测”模式
const shouldForceRemote = remoteImageMode === "force";

// 是否“禁用远程尺寸探测”模式
const shouldDisableRemote =
  // 显式设置为 disable
  remoteImageMode === "disable" ||
  // 或者：未强制开启且当前为 dev 环境
  (!shouldForceRemote && process.env.NODE_ENV === "development");

/**
 * @name: 构建最终传给 Fumadocs 的图片选项
 * @description:
 *
 * Fumadocs 内部会读取 remarkImageOptions：
 *   - external: false  → 不访问远程图片 URL
 *   - onError: "ignore" → 拉取尺寸失败时忽略错误（不阻断构建）
 */
const imageOptions = shouldForceRemote
  ? undefined // 强制模式下交由 Fumadocs 默认行为（报错）
  : {
      onError: "ignore" as const, // 失败时忽略（默认安全模式）
      ...(shouldDisableRemote && { external: false as const }), // 禁用远程请求
    };

/**
 * @name:MDX 全局配置
 *
 * @description: 包含：
 * - remarkMath：启用 Markdown 数学语法支持 ($...$, $$...$$)
 * - rehypeKatex：使用 KaTeX 将数学公式渲染为 HTML（strict:false 更宽松）
 * - remarkImageOptions：控制远程图片尺寸探测行为（上方定义）
 */
export default defineConfig({
  mdxOptions: {
    // 支持 LaTeX 公式
    remarkPlugins: [remarkMath],

    // 宽松的 KaTeX 渲染，不因轻微语法错误中断
    rehypePlugins: (v) => [[rehypeKatex, { strict: false }], ...v],

    // 仅在 imageOptions 存在时传入（开发/禁用模式下生效）
    ...(imageOptions && { remarkImageOptions: imageOptions }),
  },
});
