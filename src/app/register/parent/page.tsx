"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

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

const strongPassword = z
  .string()
  .min(8, "Minimum 8 simvol olmalıdır")
  .regex(/[A-Z]/, "Ən azı 1 böyük hərf olmalıdır")
  .regex(/[0-9]/, "Ən azı 1 rəqəm olmalıdır")
  .regex(/[^A-Za-z0-9]/, "Ən azı 1 xüsusi simvol olmalıdır");

const schema = z.object({
  fullName: z.string().min(2, "Ad Soyad tələb olunur"),
  email: z.string().email("Düzgün email daxil edin"),
  password: strongPassword,
  phone: z
    .string()
    .min(1, "Telefon tələb olunur")
    .regex(/^\+?[0-9]{7,15}$/, "Düzgün telefon nömrəsi daxil edin"),
  occupation: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "h-11 rounded-xl bg-white border-[#E2DDD5] focus-visible:border-[#4A6741] focus-visible:ring-[#4A6741]/20";

export default function ParentRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/api/v1/auth/register/parent", data);
      toast.success("Email təsdiq linki göndərildi!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Qeydiyyat zamanı xəta baş verdi");
    }
  };

  return (
    <AuthSplit
      panel={{
        title: (
          <>
            Valideyn{" "}
            <span style={{ color: "#A8CCAA" }}>nəzarəti</span>
          </>
        ),
        description:
          "Uşağınızın akademik inkişafını real vaxtda izləyin, müəllimlər ilə əlaqə saxlayın.",
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
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Valideyn qeydiyyatı</h2>
          <p className="text-sm text-muted-foreground">
            Uşağınızın təhsil prosesini izləyin
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Ad Soyad" error={errors.fullName?.message}>
            <Input
              placeholder="Leyla Kərimova"
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
                placeholder="nümunə@mail.com"
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

          <Field label="Peşə" error={errors.occupation?.message} optional>
            <Input
              placeholder="Mühasib"
              autoComplete="organization-title"
              className={inputCls}
              {...register("occupation")}
            />
          </Field>

          <SubmitButton isSubmitting={isSubmitting} label="Qeydiyyat" loadingLabel="Qeydiyyat edilir..." />
        </form>
      </div>
    </AuthSplit>
  );
}
