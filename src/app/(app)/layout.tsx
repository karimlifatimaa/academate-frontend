"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, CalendarDays, Users, Clock,
  LogOut, User, GraduationCap, Menu, X, Key, Home,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";

import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { UserAvatar } from "@/components/ui/user-avatar";

const NAV = {
  STUDENT: [
    { href: "/dashboard", label: "Ana səhifə", icon: Home },
    { href: "/lessons", label: "Dərslər", icon: CalendarDays },
    { href: "/teachers", label: "Müəllimlər", icon: GraduationCap },
    { href: "/family/invite-code", label: "Valideyn", icon: Key },
    { href: "/profile", label: "Profil", icon: User },
  ],
  TEACHER: [
    { href: "/dashboard", label: "Ana səhifə", icon: Home },
    { href: "/lessons", label: "Dərslər", icon: CalendarDays },
    { href: "/availability", label: "Mövcudluq", icon: Clock },
    { href: "/profile", label: "Profil", icon: User },
  ],
  PARENT: [
    { href: "/dashboard", label: "Ana səhifə", icon: Home },
    { href: "/family/children", label: "Uşaqlarım", icon: Users },
    { href: "/profile", label: "Profil", icon: User },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Ana səhifə", icon: Home },
    { href: "/admin/users", label: "İstifadəçilər", icon: Users },
    { href: "/admin/teachers", label: "Müəllimlər", icon: GraduationCap },
    { href: "/profile", label: "Profil", icon: User },
  ],
};

async function doLogout(clearAuth: () => void, push: (p: string) => void) {
  try {
    const refreshToken = localStorage.getItem("refresh-token");
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, { refreshToken });
  } catch { /* ignore */ }
  finally { clearAuth(); push("/login"); }
}

function TopNav({ onMobileOpen }: { onMobileOpen: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile } = useProfile();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const role = profile?.role ?? user?.role ?? "STUDENT";
  const navItems = NAV[role] ?? NAV.STUDENT;

  const ROLE_LABEL: Record<string, string> = { STUDENT: "Şagird", TEACHER: "Müəllim", PARENT: "Valideyn", ADMIN: "Admin" };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Main bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#EDE9E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-5">

          {/* Mobile menu */}
          <button onClick={onMobileOpen} className="sm:hidden p-1 text-[#7A7570] hover:text-[#1A1A1A] transition-colors">
            <Menu className="size-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-105" style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}>
              <BookOpen className="size-4 text-white" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>
              Academate
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px bg-[#E8E4DE]" />

          {/* Role pill */}
          <span className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#4A6741] bg-[#F0F5EE] border border-[#D4E5D0] shrink-0">
            {ROLE_LABEL[role] ?? role}
          </span>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-0.5 flex-1">
            {navItems.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${active ? "bg-[#4A6741] text-white shadow-sm" : "text-[#4A4A4A] hover:bg-[#F0F5EE] hover:text-[#4A6741]"}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <div className="hidden sm:flex items-center gap-2.5">
              <UserAvatar name={profile?.fullName ?? user?.fullName} url={profile?.avatarUrl} size="sm" />
              <div className="flex flex-col leading-none">
                <span className="text-[13px] font-semibold text-[#1A1A1A] max-w-[130px] truncate">
                  {profile?.fullName ?? user?.fullName}
                </span>
                <span className="text-[11px] text-[#7A7570] max-w-[130px] truncate">
                  {profile?.email ?? user?.email}
                </span>
              </div>
            </div>

            <div className="h-5 w-px bg-[#E8E4DE] hidden sm:block" />

            <button
              onClick={() => doLogout(clearAuth, router.push.bind(router))}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#7A7570] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:block">Çıxış</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile } = useProfile();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const role = profile?.role ?? user?.role ?? "STUDENT";
  const navItems = NAV[role] ?? NAV.STUDENT;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE9E3]">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}>
              <BookOpen className="size-4 text-white" />
            </span>
            <span className="font-semibold text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>Academate</span>
          </Link>
          <button onClick={onClose} className="p-1 text-[#7A7570]"><X className="size-5" /></button>
        </div>

        <div className="px-4 py-3 border-b border-[#EDE9E3]">
          <div className="flex items-center gap-3">
            <UserAvatar name={profile?.fullName ?? user?.fullName} url={profile?.avatarUrl} size="sm" />
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A] truncate">{profile?.fullName ?? user?.fullName}</p>
              <p className="text-xs text-[#7A7570] truncate">{profile?.email ?? user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active ? "bg-[#4A6741] text-white" : "text-[#4A4A4A] hover:bg-[#F0F5EE] hover:text-[#4A6741]"}`}
              >
                <Icon className="size-4 shrink-0" />{label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#EDE9E3]">
          <button
            onClick={() => doLogout(clearAuth, router.push.bind(router))}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#7A7570] hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="size-4" /> Çıxış
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen" style={{ background: "#F8F5F0" }}>
      <TopNav onMobileOpen={() => setMobileOpen(true)} />
      {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-10">{children}</main>
    </div>
  );
}
