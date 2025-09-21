import { signOut } from "@/auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user.name?.[0] ?? user.email?.[0] ?? "?";

  return (
    <details className="relative inline-block text-left">
      <summary
        className="flex cursor-pointer list-none items-center rounded-full border border-border bg-background p-0.5 transition hover:border-primary/60 [&::-webkit-details-marker]:hidden"
        aria-label="Account menu"
      >
        <Avatar className="size-9">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name ?? "User avatar"} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
      </summary>

      <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {user.name ?? "Signed in"}
          </p>
          {user.email ? (
            <p className="text-xs text-muted-foreground" title={user.email}>
              {user.email}
            </p>
          ) : null}
        </div>

        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="w-full px-4 py-2 text-left text-sm text-foreground transition hover:bg-muted"
          >
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
