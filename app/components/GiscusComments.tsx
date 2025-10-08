"use client";

import Giscus from "@giscus/react";

interface GiscusCommentsProps {
  className?: string;
  docId?: string | null;
  title?: string | null;
}

export function GiscusComments({
  className,
  docId,
  title,
}: GiscusCommentsProps) {
  const normalizedDocId = typeof docId === "string" ? docId.trim() : "";
  const normalizedTitle = typeof title === "string" ? title.trim() : "";

  const useSpecificMapping = normalizedDocId.length > 0;
  const termValue = useSpecificMapping
    ? `${normalizedTitle || "Untitled"} | ${normalizedDocId}`
    : undefined;

  return (
    <div className={className}>
      <Giscus
        repo="InvolutionHell/involutionhell.github.io"
        repoId="R_kgDOPuD_8A"
        category="Comments"
        categoryId="DIC_kwDOPuD_8M4Cvip8"
        mapping={useSpecificMapping ? "specific" : "pathname"}
        term={termValue}
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
