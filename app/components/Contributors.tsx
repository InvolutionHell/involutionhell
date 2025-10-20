import Image from "next/image";
import Link from "next/link";
import type { DocContributorsRecord } from "@/lib/contributors";

interface ContributorsProps {
  entry: DocContributorsRecord | null;
}

function formatLastContributedAt(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function Contributors({ entry }: ContributorsProps) {
  const contributors = entry?.contributors ?? [];

  if (contributors.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="contributors-heading">
      <hr className="border-border/70 !mt-10 !mb-5" />
      <h2 id="contributors-heading">贡献者</h2>
      <ul className="mt-0 mb-0 flex flex-wrap items-center gap-x-6 gap-y-4 list-none p-0">
        {contributors.map((contributor) => {
          const displayName = contributor.login ?? `#${contributor.githubId}`;
          const href = contributor.htmlUrl ?? undefined;
          const avatarSrc =
            contributor.avatarUrl ??
            `https://avatars.githubusercontent.com/u/${contributor.githubId}`;
          const lastDate = formatLastContributedAt(
            contributor.lastContributedAt,
          );

          const content = (
            <>
              <Image
                src={avatarSrc}
                alt={displayName}
                width={35}
                height={35}
                className="!m-0 h-10 w-10 rounded-full border border-border/50 object-cover shadow-sm"
              />
              <span className="flex flex-col text-left leading-tight">
                <span className="font-medium">{displayName}</span>
                <span className="text-sm text-muted-foreground">
                  贡献 {contributor.contributions} 次
                  {lastDate ? ` · 最近 ${lastDate}` : ""}
                </span>
              </span>
            </>
          );

          return (
            <li key={contributor.githubId}>
              {href ? (
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-base text-primary transition-colors hover:text-primary/80 no-underline"
                >
                  {content}
                </Link>
              ) : (
                <div className="inline-flex items-center gap-3 text-base">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <hr className="!mb-0 !mt-5 border-border/70" />
    </section>
  );
}
