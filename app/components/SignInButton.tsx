import { signIn } from "@/auth";
import { Button } from "@/app/components/ui/button";

interface SignInButtonProps {
  className?: string;
}

export function SignInButton({ className }: SignInButtonProps) {
  return (
    <form
      className={className}
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <Button type="submit" size="sm" variant="outline">
        SignIn
      </Button>
    </form>
  );
}
