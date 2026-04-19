"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { subYears, format } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const strongPassword = z
  .string()
  .min(8, "Minimum 8 simvol olmalıdır")
  .regex(/[A-Z]/, "Ən azı 1 böyük hərf olmalıdır")
  .regex(/[0-9]/, "Ən azı 1 rəqəm olmalıdır")
  .regex(/[^A-Za-z0-9]/, "Ən azı 1 xüsusi simvol olmalıdır");

const maxBirthDate = format(subYears(new Date(), 7), "yyyy-MM-dd");

const schema = z.object({
  fullName: z.string().min(2, "Ad Soyad tələb olunur"),
  email: z.string().email("Düzgün email daxil edin"),
  birthDate: z
    .string()
    .min(1, "Doğum tarixi tələb olunur")
    .refine((d) => d <= maxBirthDate, { message: "Yaş 7-dən çox olmalıdır" }),
  password: strongPassword,
  grade: z.string().min(1, "Sinif seçin"),
  city: z.string().min(1, "Şəhər tələb olunur"),
  school: z.string().min(1, "Məktəb adı tələb olunur"),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "h-11 rounded-xl bg-white border-[#E2DDD5] focus-visible:border-[#4A6741] focus-visible:ring-[#4A6741]/20";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/api/v1/auth/register/student", {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate,
        grade: Number(data.grade),
        school: data.school,
        city: data.city,
      });
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
            Şagird{" "}
            <span style={{ color: "#A8CCAA" }}>qeydiyyatı</span>
          </>
        ),
        description:
          "Məlumatlarınızı daxil edərək yeni hesab yaradın. Dərslərinizi izləyin, tapşırıqları yerinə yetirin.",
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
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Şagird qeydiyyatı</h2>
          <p className="text-sm text-muted-foreground">
            Məlumatlarınızı daxil edərək yeni hesab yaradın
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Ad Soyad" error={errors.fullName?.message}>
            <div className="relative">
              <Input
                placeholder="Mas: Əli Məmmədov"
                autoComplete="name"
                className={inputCls + " pr-10"}
                aria-invalid={!!errors.fullName}
                {...register("fullName")}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" error={errors.email?.message}>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="nümunə@mail.com"
                  autoComplete="email"
                  className={inputCls + " pr-10"}
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                  </svg>
                </span>
              </div>
            </Field>

            <Field label="Doğum tarixi" error={errors.birthDate?.message}>
              <div className="relative">
                <Input
                  type="date"
                  max={maxBirthDate}
                  className={inputCls}
                  aria-invalid={!!errors.birthDate}
                  {...register("birthDate")}
                />
              </div>
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

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sinif" error={errors.grade?.message}>
              <Controller
                name="grade"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={`w-full ${inputCls}`}
                      aria-invalid={!!errors.grade}
                    >
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}-ci sinif
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Şəhər" error={errors.city?.message}>
              <Input
                placeholder="Bakı"
                className={inputCls}
                aria-invalid={!!errors.city}
                {...register("city")}
              />
            </Field>
          </div>

          <Field label="Məktəb adı" error={errors.school?.message}>
            <Input
              placeholder="Məktəb nömrəsi və ya adı"
              className={inputCls}
              aria-invalid={!!errors.school}
              {...register("school")}
            />
          </Field>

          <SubmitButton isSubmitting={isSubmitting} label="Qeydiyyat" loadingLabel="Qeydiyyat edilir..." />
        </form>
      </div>
    </AuthSplit>
  );
}
