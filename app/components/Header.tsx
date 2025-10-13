import { ThemeToggle } from "./ThemeToggle";
import { Button } from "../../components/ui/button";
import { MessageCircle } from "lucide-react";
import { Github as GithubIcon } from "./icons/Github";
import { SignInButton } from "./SignInButton";
import { auth } from "@/auth";
import { UserMenu } from "./UserMenu";
import { BRAND_ICON_TEXT, BRAND_NAME } from "@/lib/brand";

export async function Header() {
  const session = await auth();
  const user = session?.user;
  const provider =
    session && "provider" in session
      ? (session.provider as string | undefined)
      : undefined;
  console.log("session", session);
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 简洁标识，无渐变、无圆角 */}
          <div className="w-8 h-8 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-sm font-semibold">
            {BRAND_ICON_TEXT}
          </div>
          {/* 纯文本标题，无渐变 */}
          <span className="font-semibold text-lg tracking-tight">
            {BRAND_NAME}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            特点
          </a>
          <a
            href="#community"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            社区
          </a>
          <a
            href="#contact"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            联系我们
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {/* 扁平图标按钮：移除圆角与缩放动画 */}
          <Button variant="ghost" size="icon" asChild className="rounded-none">
            <a
              href="https://github.com/involutionhell"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild className="rounded-none">
            <a
              href="https://discord.com/invite/6CGP73ZWbD"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </Button>
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} provider={provider} />
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  );
}
