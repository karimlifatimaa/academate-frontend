"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, Users, BookMarked } from "lucide-react";

const roles = [
  {
    href: "/register/student",
    icon: GraduationCap,
    title: "Şagird",
    description: "Dərslərə qoşul, tapşırıqları yerinə yetir, bilikləini artır.",
    badge: "Ən populyar",
    accent: "#4A6741",
    bg: "#F0F5EE",
  },
  {
    href: "/register/teacher",
    icon: BookMarked,
    title: "Müəllim",
    description: "Şagirdlərinizi idarə edin, tapşırıqlar verin, nəticələri izləyin.",
    badge: null,
    accent: "#3D6B8A",
    bg: "#EEF3F7",
  },
  {
    href: "/register/parent",
    icon: Users,
    title: "Valideyn",
    description: "Uşağınızın akademik inkişafını real vaxtda izləyin.",
    badge: null,
    accent: "#7A5C3D",
    bg: "#F7F3EE",
  },
];

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "#F8F5F0" }}
    >
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "#4A6741" }}
            >
              <BookOpen className="size-5 text-white" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Academate
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Azərbaycanın ən qabaqcıl təhsil platforması
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-[#F0EDE8]">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Hesab növünü seçin</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kim olduğunuzu seçin və qeydiyyatdan keçin
            </p>
          </div>

          <div className="p-4 space-y-3">
            {roles.map(({ href, icon: Icon, title, description, badge, accent, bg }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 rounded-xl border border-[#F0EDE8] bg-white p-4 transition-all hover:border-transparent hover:shadow-md hover:-translate-y-0.5"
                style={{ "--hover-bg": bg } as React.CSSProperties}
              >
                {/* Icon */}
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors"
                  style={{ background: bg }}
                >
                  <Icon
                    className="size-5 transition-colors"
                    style={{ color: accent }}
                  />
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1A1A1A] text-sm">
                      {title}
                    </span>
                    {badge && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                        style={{ background: accent }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  className="size-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>

          <div className="px-6 py-4 bg-[#FAFAF8] border-t border-[#F0EDE8] text-center">
            <p className="text-sm text-muted-foreground">
              Artıq hesabınız var?{" "}
              <Link
                href="/login"
                className="font-semibold hover:underline underline-offset-4"
                style={{ color: "#4A6741" }}
              >
                Daxil ol
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © 2024 Academate. Bütün hüquqlar qorunur.
        </p>
      </div>
    </div>
  );
}
