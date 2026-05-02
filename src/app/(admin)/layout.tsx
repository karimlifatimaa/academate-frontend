"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Users, GraduationCap, LogOut, Loader2, Home } from "lucide-react";
import axios from "axios";

import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";

const NAV = [
  { href: "/dashboard", label: "Ana səhifə", icon: Home },
  { href: "/admin/users", label: "İstifadəçilər", icon: Users },
  { href: "/admin/teachers", label: "Müəllimlər", icon: GraduationCap },
];

async function doLogout(clearAuth: () => void, push: (p: string) => void) {
  try {
    const refreshToken = localStorage.getItem("refresh-token");
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
      refreshToken,
    });
  } catch {}
  clearAuth();
  push("/login");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { data: profile, isLoading } = useProfile();

  useEffect(() => {
    if (!isLoading && profile && profile.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F5F0" }}>
        <Loader2 className="size-6 animate-spin text-[#4A6741]" />
      </div>
    );
  }

  if (!profile || profile.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen" style={{ background: "#F8F5F0" }}>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EDE9E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-5">
          <Link href="/admin/users" className="flex items-center gap-2.5 shrink-0">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
              style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
            >
              <Shield className="size-4 text-white" />
            </span>
            <span
              className="text-[15px] font-semibold tracking-tight text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Academate Admin
            </span>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-[#E8E4DE]" />

          <nav className="hidden sm:flex items-center gap-0.5 flex-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-[#4A6741] text-white shadow-sm"
                      : "text-[#4A4A4A] hover:bg-[#F0F5EE] hover:text-[#4A6741]"
                  }`}
                >
                  <Icon className="size-3.5" /> {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#4A6741] bg-[#F0F5EE] border border-[#D4E5D0]">
              {profile.fullName}
            </span>
            <button
              onClick={() => doLogout(clearAuth, router.push.bind(router))}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#7A7570] hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:block">Çıxış</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="sm:hidden flex gap-1.5 px-4 py-2 border-t border-[#EDE9E3] overflow-x-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
                  active ? "bg-[#4A6741] text-white" : "text-[#4A4A4A] bg-[#F5F2EE]"
                }`}
              >
                <Icon className="size-3" /> {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-10">{children}</main>
    </div>
  );
}
