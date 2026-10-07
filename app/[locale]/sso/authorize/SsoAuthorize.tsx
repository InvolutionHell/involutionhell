"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/app/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  SSO_CLIENTS,
  SSO_PENDING_KEY,
  parseSsoRequest,
  requestSsoRedirect,
  savePending,
} from "@/lib/sso";

const ALERT_CLASS =
  "w-full rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200";

export function SsoAuthorize() {
  const t = useTranslations("sso");
  const searchParams = useSearchParams();
  const req = useMemo(
    () => parseSsoRequest(Object.fromEntries(searchParams)),
    [searchParams],
  );
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // 以 URL 上的请求为准。不清掉残留的 pending，AuthProvider 确认登录后会拿它把本页换成旧请求
  useEffect(() => {
    sessionStorage.removeItem(SSO_PENDING_KEY);
  }, []);

  // 未登录、或「换个账号」logout 之后：存 pending 去登录，AuthProvider 登录完成后带回本页
  useEffect(() => {
    if (req && status === "unauthenticated") {
      savePending(sessionStorage, req);
      router.replace("/login");
    }
  }, [req, status, router]);

  if (!req) {
    return (
      <div role="alert" className={ALERT_CLASS}>
        {t("invalid")}
      </div>
    );
  }
  if (status !== "authenticated" || !user) {
    return (
      <div className="mx-auto size-12 rounded-full bg-muted animate-pulse" />
    );
  }

  const onContinue = async () => {
    setBusy(true);
    setFailed(false);
    const redirect = await requestSsoRedirect(
      req,
      localStorage.getItem("satoken") ?? "",
    );
    if (redirect) {
      window.location.replace(redirect);
      return;
    }
    setFailed(true);
    setBusy(false);
  };

  const name = user.displayName || user.username;
  return (
    <div className="space-y-6">
      <p className="text-lg">
        {t.rich("signInAs", {
          client: SSO_CLIENTS[req.client_id],
          name,
          user: (chunks) => (
            <span className="inline-flex items-center gap-2 align-middle font-semibold">
              <Avatar className="size-8">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt="" />
                ) : (
                  <AvatarFallback>{name[0]}</AvatarFallback>
                )}
              </Avatar>
              {chunks}
            </span>
          ),
        })}
      </p>
      {failed && (
        <div role="alert" className={ALERT_CLASS}>
          {t("failed")}
        </div>
      )}
      <div className="flex flex-col items-center gap-3">
        <Button
          className="w-48 bg-[var(--foreground)] text-[var(--background)] hover:bg-[#CC0000]"
          onClick={onContinue}
          disabled={busy}
        >
          {t("continue")}
        </Button>
        <Button
          className="w-48"
          variant="outline"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            logout();
          }}
        >
          {t("switchAccount")}
        </Button>
      </div>
    </div>
  );
}
