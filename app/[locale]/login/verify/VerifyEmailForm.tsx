"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { labelOf } from "@/app/[locale]/settings/LinkedAccounts";
import { armLoginNonce } from "@/lib/use-auth";

type Step = "loading" | "email" | "code" | "expired";

// /auth/register/* 用状态码区分失败原因，这里映射成 verifyEmail 下的 i18n key
export function resolveVerifyError(
  status: number,
  step: "send" | "verify",
): string {
  switch (status) {
    case 400:
      return step === "send" ? "errorInvalidEmail" : "errorInvalidCode";
    case 409:
      return "errorEmailTaken";
    case 410:
      return "errorExpired";
    case 429:
      return "errorRateLimited";
    default:
      return step === "send" ? "errorSendFailed" : "errorGeneric";
  }
}

const ALERT_CLASS =
  "w-full rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200";
const INPUT_CLASS =
  "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm";

export function VerifyEmailForm() {
  const t = useTranslations("verifyEmail");
  const locale = useLocale();
  const [step, setStep] = useState<Step>("loading");
  const [provider, setProvider] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const vars = { provider: labelOf(provider), email };

  // 会话凭据是 httpOnly 的 ih_reg_pending cookie，同源 fetch 自动带上
  useEffect(() => {
    fetch("/auth/register/pending")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(({ data }) => {
        setProvider(data.provider);
        setEmail(data.providerEmail ?? "");
        setStep("email");
      })
      .catch(() => setStep("expired"));
  }, []);

  async function post(kind: "send" | "verify", body: object) {
    setBusy(true);
    setError(null);
    const res = await fetch(
      kind === "send" ? "/auth/register/send-otp" : "/auth/register/verify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    ).catch(() => null);
    if (res?.ok) return res.json();
    setBusy(false);
    if (res?.status === 410) setStep("expired");
    setError(res ? resolveVerifyError(res.status, kind) : "errorGeneric");
    return null;
  }

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    if (!(await post("send", { email }))) return;
    setBusy(false);
    setCode("");
    setStep("code");
  }

  // 登录交给 use-auth 现成的 #token 流程（含 SSO 续接），所以同样要先 arm nonce
  async function verify(e: FormEvent) {
    e.preventDefault();
    const body = await post("verify", { email, code });
    if (!body) return;
    armLoginNonce(sessionStorage);
    window.location.replace(
      `/${locale}#token=${encodeURIComponent(body.data.tokenValue)}`,
    );
  }

  if (step === "loading") {
    return (
      <div className="mx-auto size-12 rounded-full bg-muted animate-pulse" />
    );
  }

  if (step === "expired") {
    return (
      <div className="space-y-4 text-center">
        <div role="alert" className={ALERT_CLASS}>
          {t(error ?? "errorExpired", vars)}
        </div>
        <Link href="/login" className="text-sm underline">
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">{t("intro", vars)}</p>
      {error && (
        <div role="alert" className={ALERT_CLASS}>
          {t(error, vars)}
        </div>
      )}
      {step === "email" ? (
        <form onSubmit={sendCode} className="space-y-3">
          <label className="block text-sm font-medium">
            {t("emailLabel")}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
          </label>
          <Button type="submit" className="w-full" disabled={busy}>
            {t("sendCode")}
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <p className="text-sm">{t("codeSent", vars)}</p>
          <label className="block text-sm font-medium">
            {t("codeLabel")}
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              className={`${INPUT_CLASS} font-mono tracking-widest`}
            />
          </label>
          <Button type="submit" className="w-full" disabled={busy}>
            {t("verify")}
          </Button>
          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => sendCode()}
              disabled={busy}
              className="underline disabled:opacity-50"
            >
              {t("resend")}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("email");
              }}
              disabled={busy}
              className="underline disabled:opacity-50"
            >
              {t("changeEmail")}
            </button>
          </div>
        </form>
      )}
      <p className="text-sm text-muted-foreground">
        {t("haveAccount", vars)}{" "}
        <Link href="/login" className="underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
