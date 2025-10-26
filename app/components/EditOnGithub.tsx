import Link from "next/link";

export function EditOnGithub({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md px-4 h-11 text-base font-medium hover:bg-muted/80 hover:text-foreground no-underline"
    >
      <svg
        aria-hidden="true"
        className="h-8 w-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
        <path d="m15 5 4 4" />
      </svg>
      Edit Me
    </Link>
  );
}
