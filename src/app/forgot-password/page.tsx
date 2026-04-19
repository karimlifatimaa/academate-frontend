"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";

import api from "@/lib/api/axios";
import { AuthSplit, Field, SubmitButton } from "@/components/auth/auth-split";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Düzgün email daxil edin"),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "h-11 rounded-xl bg-white border-[#E2DDD5] focus-visible:border-[#4A6741] focus-visible:ring-[#4A6741]/20";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/api/v1/auth/forgot-password", { email: data.email });
      setSentEmail(data.email);
      setSent(true);
    } catch {
      // Always show success to avoid email enumeration
      setSentEmail(data.email);
      setSent(true);
    }
  };

  return (
    <AuthSplit
      panel={{
        title: (
          <>
            Şifrənizi{" "}
            <span style={{ color: "#A8CCAA" }}>bərpa edin.</span>
          </>
        ),
        description:
          "Email ünvanınızı daxil edin, şifrə sıfırlama linki göndərəcəyik. Bir neçə dəqiqə ərzində emailinizi yoxlayın.",
      }}
    >
      {!sent ? (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Şifrəni unutdum
            </h2>
            <p className="text-sm text-muted-foreground">
              Emailinizi daxil edin, sıfırlama linki göndərəcəyik
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email ünvanı" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="nümunə@mail.com"
                autoComplete="email"
                className={inputCls}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </Field>

            <SubmitButton
              isSubmitting={isSubmitting}
              label="Link göndər"
              loadingLabel="Göndərilir..."
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
      ) : (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Email göndərildi
            </h2>
            <p className="text-sm text-muted-foreground">
              Göndərildi: <span className="font-medium text-[#1A1A1A]">{sentEmail}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-[#F0F5EE] p-5 flex gap-4 items-start">
            <div className="shrink-0 mt-0.5">
              <MailCheck className="size-5 text-[#4A6741]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#1A1A1A]">
                Emailinizi yoxlayın
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Şifrə sıfırlama linki göndərildi. Link 15 dəqiqə etibarlıdır.
                Spam qovluğunu da yoxlayın.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSent(false)}
              className="w-full h-11 rounded-xl border border-[#E2DDD5] bg-white text-sm font-medium text-[#1A1A1A] hover:bg-muted/50 transition-colors"
            >
              Başqa email ilə cəhd et
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Girişə qayıt
            </Link>
          </div>
        </div>
      )}
    </AuthSplit>
  );
}
