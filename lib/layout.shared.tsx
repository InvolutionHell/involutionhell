import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { SignInButton } from "@/app/components/SignInButton";
import { UserMenu } from "@/app/components/UserMenu";
import { auth } from "@/auth";
export async function baseOptions(): Promise<BaseLayoutProps> {
  const session = await auth();
  const user = session?.user;
  const provider =
    session && "provider" in session
      ? (session.provider as string | undefined)
      : undefined;
  return {
    nav: {
      title: "内卷地狱",
      children: (
        <div className="ms-auto flex items-center gap-2 pr-3">
          {user ? (
            <UserMenu user={user} provider={provider} />
          ) : (
            <SignInButton />
          )}
        </div>
      ),
    },
  };
}
