"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, LogOut, Trash2, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/authStore";

export default function SecurityPage() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Yeni parol ən azı 8 simvol olmalıdır");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Yeni parollar uyğun gəlmir");
      return;
    }
    setPwLoading(true);
    try {
      await api.post("/api/v1/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Parol uğurla dəyişdirildi");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Parol dəyişdirilə bilmədi");
    } finally {
      setPwLoading(false);
    }
  }

  async function handleLogoutAll() {
    if (!window.confirm("Bütün cihazlardan çıxmaq istədiyinizə əminsiniz?")) return;
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
    }
  }

  async function handleDeleteAccount() {
    const confirm = window.prompt(
      'Hesabınızı silmək üçün "SİL" yazın. Bu əməliyyat geri alına bilməz.'
    );
    if (confirm !== "SİL") return;
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
        <p className="text-sm text-[#7A7570] mt-1">
          Parol və hesab parametrləri
        </p>
      </div>

      {/* Change password */}
      <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="size-4 text-[#4A6741]" />
          <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
            Parolu dəyiş
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Cari parol
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#E8E4DE] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#4A6741]"
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Yeni parol
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#E8E4DE] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#4A6741]"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-[11px] text-[#B8B4AE] mt-1">Ən azı 8 simvol</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Yeni parolu təsdiq et
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#E8E4DE] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#4A6741]"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            className="px-5 h-11 rounded-xl text-sm font-bold text-white shadow-lg disabled:opacity-60 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
          >
            {pwLoading && <Loader2 className="size-4 animate-spin" />}
            Parolu dəyiş
          </button>
        </form>
      </div>

      {/* Logout all */}
      <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
              <LogOut className="size-4 text-[#4A6741]" /> Bütün sessiyalardan çıx
            </h2>
            <p className="text-sm text-[#7A7570] mt-1">
              Bütün cihazlardan çıxış et və yenidən daxil ol
            </p>
          </div>
          <button
            onClick={handleLogoutAll}
            disabled={logoutAllLoading}
            className="px-4 h-10 rounded-xl border border-[#4A6741] text-sm font-semibold text-[#4A6741] hover:bg-[#F0F5EE] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {logoutAllLoading && <Loader2 className="size-4 animate-spin" />}
            Çıxış et
          </button>
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
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="px-4 h-10 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {deleteLoading && <Loader2 className="size-4 animate-spin" />}
            Hesabı sil
          </button>
        </div>
      </div>
    </div>
  );
}
