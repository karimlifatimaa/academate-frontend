"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  ShieldAlert,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import api from "@/lib/api/axios";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/auth/auth-split";

/* ── Constants ─────────────────────────────────────────── */
const SUBJECT_LABELS: Record<string, string> = {
  AZERBAYCAN_DILI: "Azərbaycan dili",
  EDEBIYYAT: "Ədəbiyyat",
  RIYAZIYYAT: "Riyaziyyat",
  FIZIKA: "Fizika",
  KIMYA: "Kimya",
  BIOLOGIYA: "Biologiya",
  TARIX: "Tarix",
  COGRAFIYA: "Coğrafiya",
  INGILIS_DILI: "İngilis dili",
  INFORMATIKA: "İnformatika",
  MATH: "Riyaziyyat",
  PHYSICS: "Fizika",
};

const inputCls =
  "h-11 rounded-xl bg-white border-[#E2DDD5] focus-visible:border-[#4A6741] focus-visible:ring-[#4A6741]/20";

/* ── Section wrapper ───────────────────────────────────── */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F0EDE8]">
        <h2 className="font-semibold text-[#1A1A1A]">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ── Field wrapper ─────────────────────────────────────── */
function F({
  label,
  error,
  children,
  optional,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A] select-none">
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">
            (ixtiyari)
          </span>
        )}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Save button ───────────────────────────────────────── */
function SaveBtn({ loading, label = "Yadda saxla" }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70 transition-opacity hover:opacity-90"
      style={{ background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)" }}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {label}
    </button>
  );
}

/* ── Avatar section ────────────────────────────────────── */
function AvatarSection({
  name,
  avatarUrl,
  onUpload,
}: {
  name: string;
  avatarUrl: string | null;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeName = name?.trim() || "?";
  const parts = safeName.split(" ");
  const initials =
    parts.length >= 2
      ? (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
      : safeName.slice(0, 2);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Yalnız şəkil faylı yükləyin");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Maksimum fayl ölçüsü 5MB-dır");
      return;
    }
    setUploading(true);
    try {
      const params = new URLSearchParams({
        fileName: file.name,
        contentType: file.type,
      });
      const res = await api.post<{ uploadUrl: string; avatarUrl: string }>(
        `/api/v1/users/me/avatar?${params}`
      );
      const uploadRes = await fetch(res.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("S3 upload failed");
      onUpload(res.data.avatarUrl);
      toast.success("Avatar yeniləndi");
    } catch {
      toast.error("Avatar yüklənmədi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-[#4A6741]/20"
          />
        ) : (
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white uppercase"
            style={{ background: "#4A6741" }}
          >
            {initials}
          </span>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white ring-2 ring-[#4A6741]/30 hover:bg-[#F0F5EE] transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin text-[#4A6741]" />
          ) : (
            <Camera className="size-3.5 text-[#4A6741]" />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
      <div>
        <p className="font-semibold text-[#1A1A1A]">{name}</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          JPG, PNG — maks. 5MB
        </p>
      </div>
    </div>
  );
}

/* ── General info form ─────────────────────────────────── */
const generalSchema = z.object({
  fullName: z.string().min(1, "Ad tələb olunur").max(255),
  phone: z.string().max(20).optional(),
  preferredLanguage: z.enum(["az", "en", "ru"]),
});
type GeneralForm = z.infer<typeof generalSchema>;

function GeneralSection({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>["data"]> }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      fullName: profile.fullName ?? "",
      phone: profile.phone ?? "",
      preferredLanguage: (profile.preferredLanguage as "az" | "en" | "ru") ?? "az",
    },
  });

  const onSubmit = async (data: GeneralForm) => {
    setSaving(true);
    try {
      await api.patch("/api/v1/users/me", data);
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil yeniləndi");
    } catch {
      toast.error("Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Əsas məlumatlar" description="Ad, telefon və dil seçimi">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Ad Soyad" error={errors.fullName?.message}>
            <Input className={inputCls} {...register("fullName")} />
          </F>
          <F label="Email">
            <div className="relative">
              <Input
                value={profile.email}
                readOnly
                className={inputCls + " bg-muted/30 cursor-not-allowed pr-24"}
              />
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  profile.emailVerified
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {profile.emailVerified ? (
                  <><CheckCircle className="size-2.5" /> Təsdiqlənib</>
                ) : (
                  "Təsdiqlənməyib"
                )}
              </span>
            </div>
          </F>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Telefon" error={errors.phone?.message} optional>
            <Input
              type="tel"
              placeholder="+994501234567"
              className={inputCls}
              {...register("phone")}
            />
          </F>
          <F label="Dil seçimi">
            <select
              className="w-full h-11 rounded-xl border border-[#E2DDD5] bg-white px-3 text-sm focus:outline-none focus:border-[#4A6741] focus:ring-3 focus:ring-[#4A6741]/20"
              {...register("preferredLanguage")}
            >
              <option value="az">Azərbaycan</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </F>
        </div>

        <div className="flex justify-end pt-1">
          <SaveBtn loading={saving} />
        </div>
      </form>
    </Section>
  );
}

/* ── Student profile section ───────────────────────────── */
const studentSchema = z.object({
  grade: z.coerce.number().int().min(1).max(12),
  schoolName: z.string().min(1, "Məktəb adı tələb olunur"),
  city: z.string().min(1, "Şəhər tələb olunur"),
});
type StudentForm = z.input<typeof studentSchema>;

function StudentSection({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>["data"]> }) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      grade: profile.grade ?? 1,
      schoolName: profile.schoolName ?? "",
      city: profile.city ?? "",
    },
  });

  const onSubmit = async (data: StudentForm) => {
    setSaving(true);
    try {
      await api.patch("/api/v1/users/me/student-profile", data);
      toast.success("Şagird profili yeniləndi");
    } catch {
      toast.error("Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Şagird məlumatları" description="Sinif, məktəb və şəhər">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <F label="Sinif" error={errors.grade?.message}>
            <select
              className="w-full h-11 rounded-xl border border-[#E2DDD5] bg-white px-3 text-sm focus:outline-none focus:border-[#4A6741] focus:ring-3 focus:ring-[#4A6741]/20"
              {...register("grade")}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>{g}-ci sinif</option>
              ))}
            </select>
          </F>
          <F label="Şəhər" error={errors.city?.message}>
            <Input placeholder="Bakı" className={inputCls} {...register("city")} />
          </F>
          <F label="Məktəb" error={errors.schoolName?.message}>
            <Input
              placeholder="199 saylı məktəb"
              className={inputCls}
              {...register("schoolName")}
            />
          </F>
        </div>
        <div className="flex justify-end pt-1">
          <SaveBtn loading={saving} />
        </div>
      </form>
    </Section>
  );
}

/* ── Teacher profile section ───────────────────────────── */
const teacherSchema = z.object({
  bio: z.string().max(1000).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
});
type TeacherForm = z.input<typeof teacherSchema>;

function TeacherSection({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>["data"]> }) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      bio: profile.bio ?? "",
      hourlyRate: profile.hourlyRate ?? 0,
    },
  });

  const onSubmit = async (data: TeacherForm) => {
    setSaving(true);
    try {
      await api.patch("/api/v1/users/me/teacher-profile", data);
      toast.success("Müəllim profili yeniləndi");
    } catch {
      toast.error("Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Müəllim məlumatları" description="Bio, saat qiymət və fənlər">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-[#F8F5F0] p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {profile.rating?.toFixed(1) ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Reytinq</p>
          </div>
          <div className="text-center border-x border-[#E2DDD5]">
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {profile.hourlyRate ? `${profile.hourlyRate}₼` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Saat qiyməti</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {profile.isVerified ? (
                <><Shield className="size-4 text-emerald-600" /><span className="text-sm font-semibold text-emerald-600">Təsdiqlənib</span></>
              ) : (
                <><ShieldAlert className="size-4 text-amber-500" /><span className="text-sm font-semibold text-amber-500">Gözlənilir</span></>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Status</p>
          </div>
        </div>

        {/* Subjects */}
        {profile.subjects && profile.subjects.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">Tədris fənləri</label>
            <div className="flex flex-wrap gap-1.5">
              {profile.subjects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium text-white"
                  style={{ background: "#4A6741" }}
                >
                  {SUBJECT_LABELS[s] ?? s}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Fənlər qeydiyyat zamanı seçilir, dəyişdirilmir.
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <F label="Bio" optional>
              <textarea
                placeholder="Özünüz haqqında qısa məlumat..."
                rows={4}
                className="w-full rounded-xl border border-[#E2DDD5] bg-white px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#4A6741] focus:ring-3 focus:ring-[#4A6741]/20"
                {...register("bio")}
              />
            </F>
          </div>
          <F label="Saat qiyməti (₼)" error={errors.hourlyRate?.message}>
            <Input
              type="number"
              min={0}
              step={0.5}
              placeholder="25"
              className={inputCls}
              {...register("hourlyRate")}
            />
          </F>
        </div>

        <div className="flex justify-end pt-1">
          <SaveBtn loading={saving} />
        </div>
      </form>
    </Section>
  );
}

/* ── Parent section ────────────────────────────────────── */
function ParentSection({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>["data"]> }) {
  const [saving, setSaving] = useState(false);
  const [occupation, setOccupation] = useState(profile.occupation ?? "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/v1/users/me", { occupation });
      toast.success("Profil yeniləndi");
    } catch {
      toast.error("Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Valideyn məlumatları">
      <form onSubmit={onSubmit} className="space-y-4">
        <F label="Peşə" optional>
          <Input
            placeholder="Mühəndis"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className={inputCls}
          />
        </F>
        <div className="flex justify-end">
          <SaveBtn loading={saving} />
        </div>
      </form>
    </Section>
  );
}

/* ── Change password section ───────────────────────────── */
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

function PasswordSection() {
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newPw, setNewPw] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
  });

  const onSubmit = async (data: PwForm) => {
    setSaving(true);
    try {
      await api.post("/api/v1/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Şifrə uğurla dəyişdirildi");
      reset();
      setNewPw("");
    } catch (err: any) {
      if (err?.response?.status === 400) {
        toast.error("Cari şifrə yanlışdır");
      } else {
        toast.error("Xəta baş verdi");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Şifrəni dəyiş" description="Hesabınızı qorumaq üçün güclü şifrə istifadə edin">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
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
          <SaveBtn loading={saving} label="Şifrəni dəyiş" />
        </div>
      </form>
    </Section>
  );
}

/* ── Danger zone ───────────────────────────────────────── */
function DangerZone() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Hesabınız deaktiv ediləcək. Davam etmək istəyirsiniz?"
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await api.delete("/api/v1/users/me");
      clearAuth();
      router.push("/login");
      toast.success("Hesab deaktiv edildi");
    } catch {
      toast.error("Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white ring-1 ring-red-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-red-100">
        <h2 className="font-semibold text-red-600">Təhlükəli zona</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Bu əməliyyatlar geri qaytarıla bilməz
        </p>
      </div>
      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#1A1A1A]">Hesabı sil</p>
          <p className="text-sm text-muted-foreground">
            Hesabınız deaktiv edilər. Məlumatlarınız saxlanılır.
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Hesabı sil
        </button>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────── */
export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-[#4A6741]" />
      </div>
    );
  }

  if (!profile) return null;

  const avatarUrl = localAvatar ?? profile.avatarUrl;

  const handleAvatarUpload = (url: string) => {
    setLocalAvatar(url);
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Profilim</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Şəxsi məlumatlarınızı idarə edin
          </p>
        </div>
        <a
          href="/profile/security"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2DDD5] px-3.5 py-2 text-sm font-semibold text-[#4A4A4A] hover:bg-[#F0F5EE] hover:text-[#4A6741] transition-colors"
        >
          Təhlükəsizlik
        </a>
      </div>

      {/* Avatar */}
      <Section title="Profil şəkli">
        <AvatarSection
          name={profile.fullName}
          avatarUrl={avatarUrl}
          onUpload={handleAvatarUpload}
        />
      </Section>

      {/* General */}
      <GeneralSection profile={profile} />

      {/* Role-specific */}
      {profile.role === "STUDENT" && <StudentSection profile={profile} />}
      {profile.role === "TEACHER" && <TeacherSection profile={profile} />}
      {profile.role === "PARENT" && <ParentSection profile={profile} />}

      {/* Password */}
      <PasswordSection />

      {/* Danger */}
      <DangerZone />
    </div>
  );
}
