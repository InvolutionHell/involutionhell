import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { SignInButton } from "@/app/components/SignInButton";
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "内卷地狱",
      children: (
        <div className="ms-auto flex justify-end">
          <SignInButton />
        </div>
      ),
    },
  };
}
