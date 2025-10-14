import { cn } from "@/lib/utils";

interface LicenseNoticeProps {
  className?: string;
}

export function LicenseNotice({ className }: LicenseNoticeProps) {
  return (
    <p
      className={cn(
        "license-notice flex flex-wrap items-center justify-center gap-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <a href="https://involutionhell.vercel.app">Involution Hell</a>
      <span>© 2025 by</span>
      <a href="https://github.com/InvolutionHell">Involution Hell Community</a>
      <span>is licensed under</span>
      <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
        CC BY-NC-SA 4.0
      </a>
      <img
        src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
        alt=""
        style={{
          maxWidth: "1em",
          maxHeight: "1em",
          marginLeft: "0.2em",
        }}
        loading="lazy"
      />
      <img
        src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
        alt=""
        style={{
          maxWidth: "1em",
          maxHeight: "1em",
          marginLeft: "0.2em",
        }}
        loading="lazy"
      />
      <img
        src="https://mirrors.creativecommons.org/presskit/icons/nc.svg"
        alt=""
        style={{
          maxWidth: "1em",
          maxHeight: "1em",
          marginLeft: "0.2em",
        }}
        loading="lazy"
      />
      <img
        src="https://mirrors.creativecommons.org/presskit/icons/sa.svg"
        alt=""
        style={{
          maxWidth: "1em",
          maxHeight: "1em",
          marginLeft: "0.2em",
        }}
        loading="lazy"
      />
    </p>
  );
}
