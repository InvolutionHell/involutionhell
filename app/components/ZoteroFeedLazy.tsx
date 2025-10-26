"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

/**
 * 懒加载 ZoteroFeed 的 props
 * @param groupId - Zotero 组 ID
 * @param limit - 显示的文献数量
 */
interface ZoteroFeedLazyProps {
  groupId?: number;
  limit?: number;
}

/**
 * 动态导入真正组件
 * @returns ZoteroFeed 组件
 */
const ZoteroFeed = dynamic(() => import("./ZoteroFeed"), {
  ssr: false,
  loading: () => null,
});

/**
 * 懒加载 ZoteroFeed
 * @param groupId - Zotero 组 ID
 * @param limit - 显示的文献数量
 * @returns 懒加载的 ZoteroFeed 组件
 */
export default function ZoteroFeedLazy({
  groupId = 6053219,
  limit = 8,
}: ZoteroFeedLazyProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref}>
      {visible ? <ZoteroFeed groupId={groupId} limit={limit} /> : null}
    </div>
  );
}
