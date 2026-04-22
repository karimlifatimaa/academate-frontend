"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api/axios";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api
      .get(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/api/v1/auth/resend-verification");
      toast.success("Yeni təsdiq linki emailinizə göndərildi");
    } catch {
      toast.error("Link göndərilmədi. Daxil olub yenidən cəhd edin.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "#F8F5F0" }}
    >
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "#4A6741" }}
          >
            <BookOpen className="size-4 text-white" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-[#1A1A1A]">
            Academate
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-sm px-8 py-10 space-y-5">
          {status === "loading" && (
            <>
              <div className="mx-auto size-16 rounded-full bg-[#F0F5EE] flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-[#4A6741]" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[#1A1A1A] text-lg">Yoxlanılır...</p>
                <p className="text-sm text-muted-foreground">
                  Email ünvanınız təsdiqlənir
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto size-16 rounded-full bg-[#EEF5EE] flex items-center justify-center">
                <CheckCircle className="size-8 text-[#4A6741]" />
              </div>
              <div className="space-y-1.5">
                <h1 className="font-bold text-xl text-[#1A1A1A]">Email təsdiqləndi!</h1>
                <p className="text-sm text-muted-foreground">
                  Hesabınız uğurla aktiv edildi.
                  <br />
                  İndi tam imkanlara sahib olun.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex w-full h-11 items-center justify-center rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)" }}
              >
                Hesaba daxil ol
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto size-16 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="size-8 text-red-500" />
              </div>
              <div className="space-y-1.5">
                <h1 className="font-bold text-xl text-[#1A1A1A]">Link etibarsızdır</h1>
                <p className="text-sm text-muted-foreground">
                  Bu link vaxtı keçmiş və ya yanlışdır.
                  <br />
                  Yeni link göndərə bilərsiniz.
                </p>
              </div>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-70 transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)" }}
                >
                  {resending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  {resending ? "Göndərilir..." : "Yeni link göndər"}
                </button>
                <Link
                  href="/login"
                  className="inline-flex w-full h-10 items-center justify-center rounded-xl border border-[#E2DDD5] bg-white text-sm font-medium text-[#1A1A1A] hover:bg-muted/50 transition-colors"
                >
                  Girişə qayıt
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          © 2024 Academate. Bütün hüquqlar qorunur.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
