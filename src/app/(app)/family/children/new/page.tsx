"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useProfile } from "@/hooks/useProfile";
import { useRegisterChild } from "@/hooks/useFamily";

export default function RegisterChildPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { mutateAsync, isPending } = useRegisterChild();

  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState(1);
  const [schoolName, setSchoolName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  if (profileLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-[#4A6741]" />
      </div>
    );
  }

  if (profile && profile.role !== "PARENT") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-[#1A1A1A] font-semibold">Bu səhifə yalnız valideynlər üçündür</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-sm text-[#4A6741] hover:underline"
        >
          Dashboard-a qayıt
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !schoolName.trim() || !birthDate) {
      toast.error("Bütün sahələri doldurun");
      return;
    }
    try {
      await mutateAsync({
        fullName: fullName.trim(),
        grade,
        schoolName: schoolName.trim(),
        birthDate,
      });
      toast.success("Uşaq hesabı yaradıldı!");
      router.push("/family/children");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Hesab yaradıla bilmədi");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-medium text-[#7A7570] hover:text-[#4A6741] transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> Geri
      </button>

      <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 sm:p-8 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
          >
            <UserPlus className="size-5 text-white" />
          </div>
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Uşaq hesabı yarat
            </h1>
            <p className="text-sm text-[#7A7570]">
              Uşağınız üçün email tələb olunmadan hesab açın
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Ad və soyad
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Murad Kərimli"
              className="w-full h-11 px-3 rounded-xl border border-[#E8E4DE] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#4A6741]"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Sinif</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-[#E8E4DE] text-sm bg-white text-[#1A1A1A] focus:outline-none focus:border-[#4A6741]"
              >
                {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    {g}-ci sinif
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Doğum tarixi
              </label>
              <input
                type="date"
                value={birthDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#E8E4DE] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#4A6741]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Məktəb</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="12 saylı məktəb"
              className="w-full h-11 px-3 rounded-xl border border-[#E8E4DE] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#4A6741]"
              required
              maxLength={200}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 h-11 rounded-xl border border-[#E8E4DE] text-sm font-semibold text-[#4A4A4A] hover:bg-[#F5F2EE] transition-colors"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 rounded-xl text-sm font-bold text-white shadow-lg disabled:opacity-60 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Hesab yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
