/**
 * 品牌标志组件
 * 用于显示品牌名称和图标
 * @author longsihzhuo
 * @date 2025-10-14
 * @version 1.0.0
 * @description 品牌标志组件
 * @param {string} className - 类名
 * @param {string} textClassName - 文本类名
 * @param {string} imageClassName - 图片类名
 * @param {number} imageSize - 图片大小
 * @param {boolean} priority - 是否优先加载
 */
import Image from "next/image";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "Involution Hell";
export const BRAND_ICON_WEBP_SRC = "/icon.webp";
export const BRAND_ICON_PNG_SRC = "/icon.png";
export const BRAND_ICON_ALT = "Involution Hell 图标";

type BrandMarkProps = {
  className?: string;
  textClassName?: string;
  imageClassName?: string;
  imageSize?: number;
  priority?: boolean;
};

export function BrandMark({
  className,
  textClassName,
  imageClassName,
  imageSize = 32,
  priority = false,
}: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <picture>
        <source srcSet={BRAND_ICON_WEBP_SRC} type="image/webp" />
        <source srcSet={BRAND_ICON_PNG_SRC} type="image/png" />
        <Image
          src={BRAND_ICON_PNG_SRC}
          alt={BRAND_ICON_ALT}
          width={imageSize}
          height={imageSize}
          priority={priority}
          className={cn("object-contain", imageClassName)}
        />
      </picture>
      <span
        className={cn("font-semibold text-lg tracking-tight", textClassName)}
      >
        {BRAND_NAME}
      </span>
    </div>
  );
}
