import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { SignInButton } from "@/app/components/SignInButton";
import { BRAND_NAME } from "@/app/components/BrandMark";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: BRAND_NAME,
      children: (
        <div className="ms-auto flex justify-end">
          <SignInButton />
        </div>
      ),
    },
  };
}
