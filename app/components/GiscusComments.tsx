"use client";

import Giscus from "@giscus/react";

interface GiscusCommentsProps {
  className?: string;
  docId?: string | null;
}

export function GiscusComments({ className, docId }: GiscusCommentsProps) {
  const useDocId = typeof docId === "string" && docId.trim().length > 0;

  return (
    <div className={className}>
      <Giscus
        repo="InvolutionHell/involutionhell.github.io"
        repoId="R_kgDOPuD_8A"
        category="Comments"
        categoryId="DIC_kwDOPuD_8M4Cvip8"
        mapping={useDocId ? "specific" : "pathname"}
        term={useDocId ? docId : undefined}
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="preferred_color_scheme"
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
