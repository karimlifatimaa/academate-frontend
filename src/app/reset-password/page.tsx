"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";

import api from "@/lib/api/axios";
import {
  AuthSplit,
  Field,
  PasswordStrength,
  SubmitButton,
} from "@/components/auth/auth-split";
import { Input } from "@/components/ui/input";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Minimum 8 simvol olmalıdır")
      .regex(/[A-Z]/, "Ən azı 1 böyük hərf olmalıdır")
      .regex(/[a-z]/, "Ən azı 1 kiçik hərf olmalıdır")
      .regex(/[0-9]/, "Ən azı 1 rəqəm olmalıdır"),
    confirmPassword: z.string().min(1, "Şifrəni təkrarlayın"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Şifrələr uyğun gəlmir",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const inputCls =
  "h-11 rounded-xl bg-white border-[#E2DDD5] focus-visible:border-[#4A6741] focus-visible:ring-[#4A6741]/20";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <AuthSplit
        panel={{
          title: <>Etibarsız <span style={{ color: "#A8CCAA" }}>link</span></>,
          description: "Şifrə sıfırlama linki yanlış və ya vaxtı keçmiş görünür.",
        }}
      >
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Link tapılmadı</h2>
          <p className="text-sm text-muted-foreground">
            Emailinizdəki linki tam kopyalayıb yenidən cəhd edin.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex w-full h-11 items-center justify-center rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)" }}
          >
            Yeni link al
          </Link>
        </div>
      </AuthSplit>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/api/v1/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      setDone(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 400) {
        toast.error("Link etibarsız və ya vaxtı keçmişdir.");
      } else {
        toast.error(msg ?? "Xəta baş verdi, yenidən cəhd edin.");
      }
    }
  };

  if (done) {
    return (
      <AuthSplit
        panel={{
          title: <>Şifrə <span style={{ color: "#A8CCAA" }}>yeniləndi!</span></>,
          description: "Yeni şifrənizlə hesabınıza daxil ola bilərsiniz.",
        }}
      >
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Uğurlu!</h2>
            <p className="text-sm text-muted-foreground">
              Şifrəniz uğurla yeniləndi
            </p>
          </div>

          <div className="rounded-2xl bg-[#F0F5EE] p-5 flex gap-4 items-start">
            <CheckCircle className="size-5 text-[#4A6741] shrink-0 mt-0.5" />
            <p className="text-sm text-[#1A1A1A] leading-relaxed">
              Yeni şifrənizlə hesabınıza daxil ola bilərsiniz.
              Şifrənizi etibarlı yerdə saxlayın.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)" }}
          >
            Girişə keç
          </button>
        </div>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit
      panel={{
        title: (
          <>
            Yeni şifrə{" "}
            <span style={{ color: "#A8CCAA" }}>təyin edin.</span>
          </>
        ),
        description:
          "Güclü bir şifrə seçin. Böyük hərf, rəqəm və ən azı 8 simvol olmalıdır.",
      }}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            Şifrəni sıfırla
          </h2>
          <p className="text-sm text-muted-foreground">
            Yeni şifrənizi daxil edin
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Yeni şifrə" error={errors.newPassword?.message}>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={inputCls + " pr-10"}
                aria-invalid={!!errors.newPassword}
                {...register("newPassword", {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <PasswordStrength password={passwordValue} />
          </Field>

          <Field label="Şifrəni təkrarlayın" error={errors.confirmPassword?.message}>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={inputCls + " pr-10"}
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <SubmitButton
            isSubmitting={isSubmitting}
            label="Şifrəni yenilə"
            loadingLabel="Yenilənir..."
          />
        </form>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Girişə qayıt
        </Link>
      </div>
    </AuthSplit>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
