"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, X, ChevronDown } from "lucide-react";

import api from "@/lib/api/axios";
import {
  AuthSplit,
  Field,
  OrDivider,
  OAuthButtons,
  PasswordStrength,
  SubmitButton,
} from "@/components/auth/auth-split";
import { Input } from "@/components/ui/input";

/* ── Subject enum → display label ── */
const SUBJECTS: { value: string; label: string }[] = [
  { value: "AZERBAYCAN_DILI", label: "Azərbaycan dili" },
  { value: "EDEBIYYAT", label: "Ədəbiyyat" },
  { value: "RIYAZIYYAT", label: "Riyaziyyat" },
  { value: "FIZIKA", label: "Fizika" },
  { value: "KIMYA", label: "Kimya" },
  { value: "BIOLOGIYA", label: "Biologiya" },
  { value: "TARIX", label: "Tarix" },
  { value: "COGRAFIYA", label: "Coğrafiya" },
  { value: "INGILIS_DILI", label: "İngilis dili" },
  { value: "INFORMATIKA", label: "İnformatika" },
];

const strongPassword = z
  .string()
  .min(8, "Minimum 8 simvol olmalıdır")
  .regex(/[A-Z]/, "Ən azı 1 böyük hərf olmalıdır")
  .regex(/[a-z]/, "Ən azı 1 kiçik hərf olmalıdır")
  .regex(/[0-9]/, "Ən azı 1 rəqəm olmalıdır");

const schema = z.object({
  fullName: z.string().min(2, "Ad Soyad tələb olunur"),
  email: z.string().email("Düzgün email daxil edin"),
  password: strongPassword,
  phone: z
    .string()
    .min(1, "Telefon tələb olunur")
    .regex(/^\+?[0-9]{7,15}$/, "Düzgün telefon nömrəsi daxil edin"),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "h-11 rounded-xl bg-white border-[#E2DDD5] focus-visible:border-[#4A6741] focus-visible:ring-[#4A6741]/20";

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [subjectError, setSubjectError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const toggle = (value: string) => {
    setSubjectError("");
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const onSubmit = async (data: FormData) => {
    if (selected.length === 0) {
      setSubjectError("Ən azı bir fənn seçin");
      return;
    }
    try {
      await api.post("/api/v1/auth/register/teacher", {
        ...data,
        subjects: selected,
      });
      toast.success("Email təsdiq linki göndərildi!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Qeydiyyat zamanı xəta baş verdi");
    }
  };

  const selectedLabels = SUBJECTS.filter((s) => selected.includes(s.value));

  return (
    <AuthSplit
      panel={{
        title: (
          <>
            Müəllim{" "}
            <span style={{ color: "#A8CCAA" }}>portalı</span>
          </>
        ),
        description:
          "Şagirdlərinizi idarə edin, tapşırıqlar verin, nəticələri izləyin.",
      }}
      footer={
        <>
          <OrDivider />
          <OAuthButtons />
          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              Artıq hesabın var?{" "}
              <Link href="/login" className="font-medium text-[#4A6741] hover:underline underline-offset-4">
                Daxil ol
              </Link>
            </p>
            <p>
              <Link href="/register" className="hover:underline underline-offset-4">
                ← Digər hesab növü
              </Link>
            </p>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Müəllim qeydiyyatı</h2>
          <p className="text-sm text-muted-foreground">Müəllim hesabı yaradın</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Ad Soyad" error={errors.fullName?.message}>
            <Input
              placeholder="Nigar Əliyeva"
              autoComplete="name"
              className={inputCls}
              aria-invalid={!!errors.fullName}
              {...register("fullName")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="nigar@mail.com"
                autoComplete="email"
                className={inputCls}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </Field>

            <Field label="Telefon" error={errors.phone?.message}>
              <Input
                type="tel"
                placeholder="+994501234567"
                autoComplete="tel"
                className={inputCls}
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </Field>
          </div>

          <Field label="Şifrə" error={errors.password?.message}>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={inputCls + " pr-10"}
                aria-invalid={!!errors.password}
                {...register("password", {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <PasswordStrength password={passwordValue} />
          </Field>

          {/* Subject multi-select dropdown */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">Tədris fənləri</label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 h-11 rounded-xl border bg-white px-3 text-sm transition-colors"
                style={{
                  borderColor: subjectError ? "#ef4444" : dropdownOpen ? "#4A6741" : "#E2DDD5",
                  boxShadow: dropdownOpen ? "0 0 0 3px rgba(74,103,65,0.15)" : undefined,
                }}
              >
                <span className="text-muted-foreground truncate">
                  {selected.length === 0
                    ? "Fənn seçin..."
                    : `${selected.length} fənn seçildi`}
                </span>
                <ChevronDown
                  className="size-4 text-muted-foreground shrink-0 transition-transform"
                  style={{ transform: dropdownOpen ? "rotate(180deg)" : undefined }}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-[#E2DDD5] bg-white shadow-lg overflow-hidden">
                  <div className="p-1.5 space-y-0.5 max-h-52 overflow-y-auto">
                    {SUBJECTS.map(({ value, label }) => {
                      const checked = selected.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggle(value)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#F0F5EE] text-left"
                        >
                          <span
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                            style={{
                              borderColor: checked ? "#4A6741" : "#D1CDC7",
                              background: checked ? "#4A6741" : "white",
                            }}
                          >
                            {checked && (
                              <svg className="size-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span className={checked ? "font-medium text-[#1A1A1A]" : "text-[#4A4A4A]"}>
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-[#F0EDE8] px-3 py-2 flex justify-between items-center bg-[#FAFAF8]">
                    <span className="text-xs text-muted-foreground">
                      {selected.length} / {SUBJECTS.length} seçildi
                    </span>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(false)}
                      className="text-xs font-medium text-[#4A6741] hover:underline"
                    >
                      Tətbiq et
                    </button>
                  </div>
                </div>
              )}
            </div>

            {subjectError && <p className="text-xs text-red-500">{subjectError}</p>}

            {/* Selected tags */}
            {selectedLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedLabels.map(({ value, label }) => (
                  <span
                    key={value}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-white"
                    style={{ background: "#4A6741" }}
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => toggle(value)}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                      aria-label={`${label} sil`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <SubmitButton isSubmitting={isSubmitting} label="Qeydiyyat" loadingLabel="Qeydiyyat edilir..." />
        </form>
      </div>
    </AuthSplit>
  );
}
