"use client";

import { Button } from "@/components/ui/button";

interface SignInButtonClientProps {
  className?: string;
}

export function SignInButtonClient({ className }: SignInButtonClientProps) {
  const handleSignIn = async () => {
    // Use window.location for client-side navigation to sign-in
    window.location.href = "/api/auth/signin";
  };

  return (
    <Button
      className={className}
      onClick={handleSignIn}
      size="sm"
      variant="outline"
    >
      登录
    </Button>
  );
}
