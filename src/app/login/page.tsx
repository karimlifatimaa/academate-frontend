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
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse } from "@/types/auth";
import {
  AuthSplit,
  Field,
  OrDivider,
  OAuthButtons,
  SubmitButton,
} from "@/components/auth/auth-split";
import { Input } from "@/components/ui/input";

const schema = z.object({
  identifier: z.string().min(1, "Bu sahə tələb olunur"),
  password: z.string().min(1, "Şifrə tələb olunur"),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "h-11 rounded-xl bg-white border-[#E2DDD5] focus-visible:border-[#4A6741] focus-visible:ring-[#4A6741]/20";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post<AuthResponse>("/api/v1/auth/login", {
        identifier: data.identifier,
        password: data.password,
      });
      const { accessToken, refreshToken, user } = res.data;
      localStorage.setItem("refresh-token", refreshToken);
      setAuth(accessToken, user);
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.response?.status === 423) {
        toast.error("Hesab müvəqqəti kilidlənib. 15 dəqiqə sonra cəhd edin.");
      } else {
        toast.error("Email və ya şifrə yanlışdır.");
      }
    }
  };

  return (
    <AuthSplit
      panel={{
        title: (
          <>
            Xoş gəldiniz,{" "}
            <span style={{ color: "#A8CCAA" }}>yenidən.</span>
          </>
        ),
        description:
          "Hesabınıza daxil olun və öyrənməyə davam edin. Bilikləriniz sizi gözləyir.",
      }}
      footer={
        <>
          <OrDivider />
          <OAuthButtons />
          <p className="text-center text-sm text-muted-foreground">
            Hesabınız yoxdur?{" "}
            <Link
              href="/register"
              className="font-medium text-[#4A6741] hover:underline underline-offset-4"
            >
              Qeydiyyat
            </Link>
          </p>
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Daxil ol</h2>
          <p className="text-sm text-muted-foreground">
            Email və ya istifadəçi adınızı daxil edin
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email və ya istifadəçi adı" error={errors.identifier?.message}>
            <Input
              placeholder="nümunə@mail.com"
              autoComplete="username"
              className={inputCls}
              aria-invalid={!!errors.identifier}
              {...register("identifier")}
            />
          </Field>

          {/* Password with "forgot" link */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1A1A1A] select-none">
                Şifrə
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#4A6741] hover:underline underline-offset-4"
              >
                Şifrəni unutdum?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputCls + " pr-10"}
                aria-invalid={!!errors.password}
                {...register("password")}
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
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <SubmitButton
            isSubmitting={isSubmitting}
            label="Daxil ol"
            loadingLabel="Yoxlanılır..."
          />
        </form>
      </div>
    </AuthSplit>
  );
}
