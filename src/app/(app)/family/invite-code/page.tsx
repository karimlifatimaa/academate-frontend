"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Key, Users, Loader2, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { az } from "date-fns/locale";

import { useProfile } from "@/hooks/useProfile";
import { useGenerateInviteCode, useMyParents } from "@/hooks/useFamily";
import { UserAvatar } from "@/components/ui/user-avatar";

export default function InviteCodePage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: parents, isLoading: parentsLoading } = useMyParents();
  const { mutateAsync: generate, isPending } = useGenerateInviteCode();

  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (profileLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-[#4A6741]" />
      </div>
    );
  }

  if (profile && profile.role !== "STUDENT") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-[#1A1A1A] font-semibold">Bu səhifə yalnız şagirdlər üçündür</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-sm text-[#4A6741] hover:underline"
        >
          Dashboard-a qayıt
        </button>
      </div>
    );
  }

  async function handleGenerate() {
    try {
      const res = await generate();
      setCode(res.code);
      setExpiresAt(res.expiresAt);
      setCopied(false);
      toast.success("Yeni dəvət kodu yaradıldı");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Kod yaradıla bilmədi");
    }
  }

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Kopyalandı");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalanmadı");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Valideyn dəvəti
        </h1>
        <p className="text-sm text-[#7A7570] mt-1">
          Valideyninizin sizə bağlana bilməsi üçün kod yaradın və onunla paylaşın
        </p>
      </div>

      {/* Code generator */}
      <div
        className="rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#4A6741]/15 text-white"
        style={{ background: "linear-gradient(145deg,#2a4826,#3d5c35,#4A6741)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-[#A8CCAA]" />
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">
            Dəvət Kodu
          </p>
        </div>

        {code ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="inline-flex px-5 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-3xl sm:text-4xl font-black tracking-[0.2em] text-white"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                {code}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 h-11 rounded-xl bg-white text-[#4A6741] text-sm font-bold hover:bg-white/90 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="size-4" /> Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Kopyala
                  </>
                )}
              </button>
            </div>
            {expiresAt && (
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Clock className="size-3.5" />
                Bitir:{" "}
                {format(parseISO(expiresAt), "d MMMM yyyy, HH:mm", { locale: az })}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={isPending}
              className="text-xs font-semibold text-white/70 hover:text-white underline-offset-2 hover:underline disabled:opacity-50"
            >
              Yeni kod yarat
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="px-5 h-12 rounded-2xl bg-white text-[#4A6741] text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Key className="size-4" />
            )}
            Kod yarat
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em] mb-4">
          Necə işləyir
        </h2>
        <ol className="space-y-3 text-sm text-[#4A4A4A]">
          {[
            "Kod yarat düyməsini basın",
            "Kodu valideyninizə göndərin (WhatsApp, SMS və ya şifahi)",
            'Valideyniniz "Uşaqlarım" səhifəsindən kodla bağlana bilər',
            "Bağlandıqdan sonra valideyniniz təhsil tərəqqinizi izləyə biləcək",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
              >
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* My parents */}
      <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
            Bağlı valideynlər
          </h2>
          <Users className="size-4 text-[#7A7570]" />
        </div>

        {parentsLoading ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="size-5 animate-spin text-[#4A6741]" />
          </div>
        ) : !parents || parents.length === 0 ? (
          <p className="text-sm text-[#B8B4AE] italic">Hələ heç bir valideyn bağlanmayıb</p>
        ) : (
          <div className="divide-y divide-[#F5F2EE]">
            {parents.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <UserAvatar name={p.fullName} url={p.avatarUrl} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                    {p.fullName}
                  </p>
                  <p className="text-xs text-[#7A7570] truncate">{p.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
