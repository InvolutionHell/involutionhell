import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { SignInButton } from "@/app/components/SignInButton";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Involution Hell",
      children: (
        <div className="ms-auto flex justify-end">
          <SignInButton />
        </div>
      ),
    },
  };
}
