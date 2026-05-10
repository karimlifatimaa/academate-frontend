"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, LogOut, Trash2, Loader2, Shield, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/auth/auth-split";

const inputCls = "h-11 rounded-xl bg-white border-[#E2DDD5] focus-visible:border-[#4A6741] focus-visible:ring-[#4A6741]/20";

const pwSchema = z
  .object({
    currentPassword: z.string().min(1, "Cari şifrəni daxil edin"),
    newPassword: z
      .string()
      .min(8, "Min. 8 simvol")
      .regex(/[A-Z]/, "1 böyük hərf")
      .regex(/[a-z]/, "1 kiçik hərf")
      .regex(/[0-9]/, "1 rəqəm"),
    confirmPassword: z.string().min(1, "Şifrəni təkrarlayın"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Şifrələr uyğun gəlmir",
    path: ["confirmPassword"],
  });
type PwForm = z.infer<typeof pwSchema>;

function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function SecurityPage() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
  });

  async function onChangePassword(data: PwForm) {
    setPwLoading(true);
    try {
      await api.post("/api/v1/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Şifrə uğurla dəyişdirildi");
      reset();
      setNewPw("");
    } catch (err: any) {
      toast.error(
        err?.response?.status === 400
          ? "Cari şifrə yanlışdır"
          : "Xəta baş verdi"
      );
    } finally {
      setPwLoading(false);
    }
  }

  async function handleLogoutAll() {
    setLogoutAllLoading(true);
    try {
      await api.post("/api/v1/auth/logout-all");
      toast.success("Bütün sessiyalardan çıxış edildi");
      clearAuth();
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Xəta baş verdi");
    } finally {
      setLogoutAllLoading(false);
      setConfirmingLogout(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      await api.delete("/api/v1/users/me");
      toast.success("Hesab silindi");
      clearAuth();
      router.push("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Hesab silinmədi");
    } finally {
      setDeleteLoading(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/profile")}
        className="flex items-center gap-1.5 text-sm font-medium text-[#7A7570] hover:text-[#4A6741] transition-colors"
      >
        <ArrowLeft className="size-4" /> Profilə qayıt
      </button>

      <div>
        <h1
          className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Shield className="size-6 text-[#4A6741]" /> Təhlükəsizlik
        </h1>
        <p className="text-sm text-[#7A7570] mt-1">Şifrə və hesab parametrləri</p>
      </div>

      {/* Change password */}
      <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="size-4 text-[#4A6741]" />
          <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">Şifrəni dəyiş</h2>
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <F label="Cari şifrə" error={errors.currentPassword?.message}>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                className={inputCls + " pr-10"}
                autoComplete="current-password"
                {...register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </F>

          <F label="Yeni şifrə" error={errors.newPassword?.message}>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                className={inputCls + " pr-10"}
                autoComplete="new-password"
                {...register("newPassword", { onChange: (e) => setNewPw(e.target.value) })}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <PasswordStrength password={newPw} />
          </F>

          <F label="Yeni şifrəni təkrarlayın" error={errors.confirmPassword?.message}>
            <Input
              type="password"
              placeholder="••••••••"
              className={inputCls}
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </F>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={pwLoading}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
            >
              {pwLoading && <Loader2 className="size-4 animate-spin" />}
              Şifrəni dəyiş
            </button>
          </div>
        </form>
      </div>

      {/* Logout all devices */}
      <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
              <LogOut className="size-4 text-[#4A6741]" /> Bütün sessiyalardan çıx
            </h2>
            <p className="text-sm text-[#7A7570] mt-1">
              Bütün cihazlardakı aktiv sessiyalar sonlandırılacaq
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {confirmingLogout ? (
              <>
                <button
                  onClick={() => setConfirmingLogout(false)}
                  className="rounded-xl border border-[#E2DDD5] px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F8F5F0] transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleLogoutAll}
                  disabled={logoutAllLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#4A6741] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {logoutAllLoading && <Loader2 className="size-4 animate-spin" />}
                  Əminəm, çıx
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmingLogout(true)}
                className="rounded-xl border border-[#4A6741] px-4 py-2 text-sm font-semibold text-[#4A6741] hover:bg-[#F0F5EE] transition-colors"
              >
                Çıxış et
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-3xl bg-white border border-red-200 p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="size-4" /> Hesabı sil
            </h2>
            <p className="text-sm text-[#7A7570] mt-1">
              Hesabınız deaktiv ediləcək. Bu əməliyyat geri alına bilməz.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {confirmingDelete ? (
              <>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-xl border border-[#E2DDD5] px-3 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-[#F8F5F0] transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deleteLoading && <Loader2 className="size-4 animate-spin" />}
                  Əminəm, sil
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                Hesabı sil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
