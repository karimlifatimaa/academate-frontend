"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen, Star, BadgeCheck, ArrowRight, LogOut,
  GraduationCap, CalendarDays, Users, Sparkles, Lock,
  Baby, UserCheck, Key, ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios";

import { useAuthStore } from "@/store/authStore";
import type { MyProfileResponse, TeacherSearchResponse } from "@/types/profile";
import type { UserRole } from "@/types/auth";
import { SUBJECTS, SUBJECT_LABEL, ROLE_LABEL } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

const NAV_BY_ROLE: Record<string, { href: string; label: string }[]> = {
  STUDENT: [
    { href: "/lessons", label: "Dərslər" },
    { href: "/teachers", label: "Müəllimlər" },
    { href: "/profile", label: "Profil" },
  ],
  TEACHER: [
    { href: "/lessons", label: "Dərslər" },
    { href: "/availability", label: "Mövcudluq" },
    { href: "/profile", label: "Profil" },
  ],
  PARENT: [
    { href: "/family/children", label: "Uşaqlarım" },
    { href: "/profile", label: "Profil" },
  ],
};

/* ── Helpers ─────────────────────────────────────── */
async function doLogout(clearAuth: () => void, push: (p: string) => void) {
  try {
    const refreshToken = localStorage.getItem("refresh-token");
    await api.post("/api/v1/auth/logout", { refreshToken });
  } catch { /* ignore */ }
  finally { clearAuth(); push("/login"); }
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ── NavBar ──────────────────────────────────────── */
function NavBar({ isAuth, profile, user, clearAuth }: {
  isAuth: boolean;
  profile?: MyProfileResponse;
  user: { fullName?: string | null; email?: string | null; role?: UserRole } | null;
  clearAuth: () => void;
}) {
  const router = useRouter();
  const role = profile?.role ?? user?.role ?? "STUDENT";
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.STUDENT;
  const name = profile?.fullName ?? user?.fullName;
  const initials = getInitials(name);
  const avatarUrl = profile?.avatarUrl;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-2xl border-b border-[#EDE9E3]/80">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center gap-5">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl shadow-sm transition-all group-hover:scale-105"
            style={{ background: "linear-gradient(135deg,#3d5c35,#5a8260)" }}>
            <BookOpen className="size-4 text-white" />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-display)" }}>
            Academate
          </span>
        </Link>

        {isAuth ? (
          <>
            <div className="hidden sm:block h-5 w-px bg-[#E8E4DE]" />
            <span className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#4A6741] bg-[#EEF5EC] border border-[#C8E0C5]">
              {ROLE_LABEL[role] ?? role}
            </span>
            <nav className="hidden sm:flex items-center gap-0.5 flex-1">
              {navItems.map(({ href, label }) => (
                <Link key={href} href={href}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-[#4A4A4A] hover:bg-[#F0F5EE] hover:text-[#4A6741] transition-all duration-150">
                  {label}
                </Link>
              ))}
            </nav>
          </>
        ) : (
          <nav className="hidden sm:flex items-center gap-7 flex-1">
            <button onClick={() => scrollTo("muellimlər")}
              className="text-sm font-medium text-[#5C5752] hover:text-[#4A6741] transition-colors cursor-pointer">
              Müəllimlər
            </button>
            <button onClick={() => scrollTo("haqqimizda")}
              className="text-sm font-medium text-[#5C5752] hover:text-[#4A6741] transition-colors cursor-pointer">
              Haqqımızda
            </button>
          </nav>
        )}

        <div className="flex items-center gap-3 ml-auto shrink-0">
          {isAuth ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name ?? ""} className="h-8 w-8 rounded-full object-cover ring-2 ring-[#4A6741]/20" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white uppercase"
                    style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}>
                    {initials}
                  </span>
                )}
                <div className="flex flex-col leading-none">
                  <span className="text-[13px] font-semibold text-[#1A1A1A] max-w-[120px] truncate">{name}</span>
                  <span className="text-[11px] text-[#9A9590] max-w-[120px] truncate">{profile?.email ?? user?.email}</span>
                </div>
              </div>
              <div className="h-5 w-px bg-[#E8E4DE] hidden sm:block" />
              <button onClick={() => doLogout(clearAuth, router.push.bind(router))}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#7A7570] hover:text-red-500 hover:bg-red-50 transition-all">
                <LogOut className="size-3.5" />
                <span className="hidden sm:block">Çıxış</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#4A4A4A] border border-[#E2DDD5] hover:border-[#4A6741] hover:text-[#4A6741] transition-all">
                Giriş
              </Link>
              <Link href="/register"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}>
                Qeydiyyat
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Public Teacher Card — horizontal EduPrime style ── */
function PublicTeacherCard({ teacher, isAuth }: { teacher: TeacherSearchResponse; isAuth: boolean }) {
  const router = useRouter();
  const initials = getInitials(teacher.fullName);
  const rating = teacher.rating ?? 0;

  const handleClick = () => {
    if (isAuth) router.push(`/teachers/${teacher.id}`);
    else router.push(`/login?redirect=/teachers/${teacher.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-5 rounded-2xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_30px_rgba(74,103,65,0.10)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="h-[72px] w-[72px] rounded-2xl overflow-hidden shadow-md">
          {teacher.avatarUrl ? (
            <img src={teacher.avatarUrl} alt={teacher.fullName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(145deg,#2d4a27,#4A6741,#6B8F6E)" }}>
              <span className="text-xl font-bold text-white uppercase select-none"
                style={{ fontFamily: "var(--font-display)" }}>
                {initials}
              </span>
            </div>
          )}
        </div>
        {teacher.isVerified && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4A6741] shadow-sm ring-2 ring-white">
            <BadgeCheck className="size-3 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-[#1A1A1A] group-hover:text-[#4A6741] transition-colors truncate"
              style={{ fontFamily: "var(--font-display)" }}>
              {teacher.fullName}
            </h3>
            {teacher.isVerified && (
              <span className="text-[10px] font-semibold text-[#4A6741]">Təsdiqlənmiş müəllim</span>
            )}
          </div>
          {teacher.hourlyRate != null && (
            <span className="shrink-0 text-[14px] font-bold text-[#4A6741]">
              {teacher.hourlyRate} <span className="text-[10px] font-normal text-[#9A9590]">AZN/saat</span>
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`size-3 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
          ))}
          <span className="text-[12px] font-semibold text-[#3A3A3A] ml-0.5">{rating.toFixed(1)}</span>
          {teacher.reviewCount > 0 && <span className="text-[11px] text-[#9A9590]">({teacher.reviewCount} rəy)</span>}
        </div>

        {/* Subjects */}
        <div className="flex flex-wrap gap-1 mt-2">
          {teacher.subjects.slice(0, 3).map(s => (
            <span key={s} className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#EEF5EC] text-[#4A6741]">
              {SUBJECT_LABEL[s] ?? s}
            </span>
          ))}
          {teacher.subjects.length > 3 && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#F5F4F2] text-[#9A9590]">
              +{teacher.subjects.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight className="size-4 text-[#C0BDB8] group-hover:text-[#4A6741] group-hover:translate-x-0.5 transition-all shrink-0" />
    </div>
  );
}

/* ── Card Skeleton ────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="flex items-center gap-5 rounded-2xl bg-white border border-[#EDE9E3] p-5 animate-pulse">
      <div className="h-[72px] w-[72px] rounded-2xl bg-[#F0EDE8] shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-36 bg-[#F0EDE8] rounded-lg" />
        <div className="h-3 w-24 bg-[#F5F2EE] rounded-lg" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-[#F0EDE8] rounded-full" />
          <div className="h-5 w-14 bg-[#F0EDE8] rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────── */
export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [hasCookie, setHasCookie] = useState(false);

  useEffect(() => {
    setHasCookie(document.cookie.includes("access-token="));
  }, []);

  const { data: profile } = useQuery<MyProfileResponse>({
    queryKey: ["profile"],
    queryFn: () => api.get<MyProfileResponse>("/api/v1/users/me/profile").then(r => r.data),
    enabled: hasCookie,
    staleTime: 30_000,
    retry: false,
  });

  const { data: topTeachers, isLoading: teachersLoading } = useQuery<TeacherSearchResponse[]>({
    queryKey: ["teachers", "top"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/teachers?sort=rating%2Cdesc&size=6`
        );
        if (!res.ok) return [];
        const d = await res.json();
        return d.content ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const isAuth = hasCookie;
  const role = profile?.role ?? user?.role ?? "STUDENT";

  const roleQuickLink =
    role === "PARENT"
      ? { href: "/family/children", label: "Uşaqlarıma bax", icon: Users }
      : role === "TEACHER"
      ? { href: "/lessons", label: "Gözlənilən dərslər", icon: CalendarDays }
      : { href: "/lessons", label: "Dərslərimə bax", icon: CalendarDays };

  const SHOW_FREE = 4; // visible teacher cards before login gate
  const visibleTeachers = topTeachers?.slice(0, SHOW_FREE) ?? [];
  const lockedTeachers = topTeachers?.slice(SHOW_FREE) ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#F8F5F0" }}>
      <NavBar isAuth={isAuth} profile={profile} user={user} clearAuth={clearAuth} />

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: "linear-gradient(150deg,#0d1f0c 0%,#192d18 25%,#2a4826 50%,#4A6741 78%,#7aaa7d 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full border border-white/[0.06]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] rounded-full border border-white/[0.04]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1000px] w-[1000px] rounded-full border border-white/[0.025]" />
          <div className="absolute -top-40 right-0 h-[450px] w-[450px] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/[0.04] blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] backdrop-blur-md px-5 py-2 mb-8">
            <Sparkles className="size-3.5 text-[#A8CCAA]" />
            <span className="text-[11px] font-bold text-white/65 tracking-[0.18em] uppercase">Peşəkar tədris platforması</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.03] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-display)" }}>
            Ən yaxşı müəllimi
            <br />
            <em className="not-italic" style={{ color: "#A8CCAA" }}>tapın</em>, öyrənin
          </h1>

          <p className="text-white/50 text-base sm:text-xl max-w-lg mx-auto mb-12 leading-relaxed font-light">
            Azərbaycanın ən peşəkar müəllimləri ilə birgə hədəflərinizə çatın
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => scrollTo("muellimlər")}
              className="flex items-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-black/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#4A6741,#7aaa7d)" }}>
              Müəllim tap <ArrowRight className="size-4" />
            </button>
            {!isAuth && (
              <Link href="/register"
                className="flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold border border-white/20 bg-white/10 backdrop-blur-sm text-white/75 hover:bg-white/18 hover:text-white transition-all duration-200">
                Pulsuz qeydiyyat
              </Link>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-12">
            {SUBJECTS.slice(0, 6).map(({ label, emoji }) => (
              <button key={label} onClick={() => scrollTo("muellimlər")}
                className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.07] backdrop-blur-sm px-3.5 py-1.5 text-[12px] font-medium text-white/60 hover:bg-white/15 hover:text-white/90 transition-all duration-200 cursor-pointer">
                <span className="text-sm">{emoji}</span> {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Auth Welcome ──────────────────────────── */}
      {isAuth && profile && (
        <section className="border-b border-[#EDE9E3]" style={{ background: "#FEFCFA" }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg,#EEF5EC,#D8EED5)" }}>
                <GraduationCap className="size-5 text-[#4A6741]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1A1A1A]">
                  Xoş gəldin, {profile.fullName?.split(" ")[0]}! 👋
                </p>
                <p className="text-[11px] text-[#9A9590]">{ROLE_LABEL[role] ?? role} hesabı</p>
              </div>
            </div>
            <Link href={roleQuickLink.href}
              className="flex items-center gap-2 rounded-xl border border-[#C8E0C5] bg-[#EEF5EC] px-4 py-2 text-xs font-semibold text-[#4A6741] hover:bg-[#E2EDD8] transition-all">
              <roleQuickLink.icon className="size-3.5" />
              {roleQuickLink.label} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* ── Subject Categories ────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-12">
        <div className="flex items-end justify-between mb-9">
          <div>
            <p className="text-[10px] font-bold text-[#4A6741] uppercase tracking-[0.18em] mb-2">Fənnlər</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-display)" }}>
              Hansı fənnə öyrənmək istəyirsən?
            </h2>
          </div>
          <button onClick={() => scrollTo("muellimlər")}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#4A6741] hover:opacity-70 transition-opacity shrink-0 cursor-pointer">
            Hamısı <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {SUBJECTS.map(({ label, emoji }) => (
            <button key={label} onClick={() => scrollTo("muellimlər")}
              className="group relative flex items-center gap-3 rounded-2xl bg-white border border-[#EDE9E3] px-4 py-3.5 overflow-hidden hover:border-[#B8D8B5] hover:shadow-lg hover:shadow-[#4A6741]/8 hover:-translate-y-0.5 transition-all duration-200 text-left cursor-pointer">
              <span className="text-xl shrink-0">{emoji}</span>
              <span className="text-[13px] font-semibold text-[#2A2A2A] group-hover:text-[#4A6741] transition-colors leading-snug">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Top Teachers ─────────────────────────── */}
      <section id="muellimlər" className="scroll-mt-20 py-14 sm:py-16" style={{ background: "#FEFCFA" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-9">
            <div>
              <p className="text-[10px] font-bold text-[#4A6741] uppercase tracking-[0.18em] mb-2">Tövsiyə olunanlar</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]"
                style={{ fontFamily: "var(--font-display)" }}>
                Ən yaxşı reytinqli müəllimlər
              </h2>
            </div>
            <Link href={isAuth ? "/teachers" : "/login"}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#4A6741] hover:opacity-70 transition-opacity shrink-0">
              Hamısı <ArrowRight className="size-4" />
            </Link>
          </div>

          {teachersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {/* Teacher list */}
              <div className="space-y-3">
                {visibleTeachers.map(t => (
                  <PublicTeacherCard key={t.id} teacher={t} isAuth={isAuth} />
                ))}
              </div>

              {/* After 3 cards — soft login gate */}
              {!isAuth && (visibleTeachers.length > 0 || lockedTeachers.length > 0) && (
                <div className="relative mt-3">
                  {/* Blurred locked cards */}
                  {lockedTeachers.length > 0 && (
                    <div className="space-y-3 pointer-events-none select-none"
                      style={{ filter: "blur(5px)", opacity: 0.25 }}>
                      {lockedTeachers.map(t => (
                        <PublicTeacherCard key={t.id} teacher={t} isAuth={false} />
                      ))}
                    </div>
                  )}
                  {/* Gradient + CTA */}
                  <div className={`${lockedTeachers.length > 0 ? "absolute inset-0" : ""} flex flex-col items-center justify-center text-center px-6 pt-8 pb-2`}
                    style={lockedTeachers.length > 0 ? { background: "linear-gradient(to top, #F8F5F0 60%, rgba(248,245,240,0.4) 100%)" } : {}}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3"
                      style={{ background: "linear-gradient(135deg,#EEF5EC,#D8EED5)" }}>
                      <Lock className="size-5 text-[#4A6741]" />
                    </div>
                    <p className="text-base font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: "var(--font-display)" }}>
                      Müəllim profilinə baxmaq üçün daxil ol
                    </p>
                    <p className="text-sm text-[#7A7570] mb-5">Pulsuz hesab aç, bütün müəllimlərə bax</p>
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      <Link href="/register"
                        className="rounded-2xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}>
                        Pulsuz qeydiyyat
                      </Link>
                      <Link href="/login"
                        className="rounded-2xl px-6 py-2.5 text-sm font-semibold text-[#4A6741] border border-[#C8E0C5] bg-[#EEF5EC] hover:bg-[#E2EDD8] transition-all">
                        Giriş et
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Authenticated — show all + See all */}
              {isAuth && (
                <div className="space-y-3 mt-0">
                  {lockedTeachers.map(t => (
                    <PublicTeacherCard key={t.id} teacher={t} isAuth={isAuth} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Parent Feature ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold text-[#4A6741] uppercase tracking-[0.18em] mb-2">Valideynlər üçün</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>
            Uşağınızın təhsilini idarə edin
          </h2>
          <p className="text-sm text-[#7A7570] mt-2 max-w-xl mx-auto">
            İki sadə üsulla uşağınızı platformaya əlavə edin
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Method 1 */}
          <div className="relative rounded-3xl bg-white border border-[#EDE9E3] p-7 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#EEF5EC] blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-5"
                style={{ background: "linear-gradient(135deg,#EEF5EC,#C8E0C5)" }}>
                <Baby className="size-6 text-[#4A6741]" />
              </div>
              <div className="text-[10px] font-bold text-[#4A6741] uppercase tracking-[0.15em] mb-2">Üsul 1</div>
              <h3 className="text-[16px] font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Kiçik uşaq üçün
              </h3>
              <p className="text-sm text-[#6A6560] leading-relaxed mb-5">
                7 yaşdan kiçik uşaqlar üçün valideyn birbaşa uşağın profilini yaradır. Uşağın email və şifrəsi tələb olunmur.
              </p>
              <div className="space-y-2">
                {["Valideyn kimi qeydiyyatdan keç", "«Uşaq əlavə et» seçimini seç", "Uşağın məlumatlarını daxil et"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2.5 text-[12px] text-[#4A4A4A]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                      style={{ background: "#4A6741" }}>
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Method 2 */}
          <div className="relative rounded-3xl bg-white border border-[#EDE9E3] p-7 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#FFF8EE] blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-5"
                style={{ background: "linear-gradient(135deg,#FFF3DC,#FFE4A0)" }}>
                <Key className="size-6 text-[#B45309]" />
              </div>
              <div className="text-[10px] font-bold text-[#B45309] uppercase tracking-[0.15em] mb-2">Üsul 2</div>
              <h3 className="text-[16px] font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Böyük şagird üçün
              </h3>
              <p className="text-sm text-[#6A6560] leading-relaxed mb-5">
                Öz hesabı olan şagirdlər 6 simvollu invite kod yaradır. Valideyn bu kodu daxil edib uşaqla bağlanır.
              </p>
              <div className="space-y-2">
                {["Şagird hesabına daxil olur", "Invite kod yaradır (6 simvol)", "Valideyn kodu daxil edir"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2.5 text-[12px] text-[#4A4A4A]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                      style={{ background: "#B45309" }}>
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-8">
          {isAuth ? (
            <Link href="/family/children"
              className="flex items-center gap-2 rounded-2xl border border-[#C8E0C5] bg-[#EEF5EC] px-6 py-3 text-sm font-semibold text-[#4A6741] hover:bg-[#E2EDD8] transition-all">
              <Users className="size-4" /> Uşaqlarımı idarə et <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Link href="/register?role=parent"
              className="flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}>
              <UserCheck className="size-4" /> Valideyn kimi qeydiyyat <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      </section>

      {/* ── How it Works ─────────────────────────── */}
      <section id="haqqimizda" className="scroll-mt-20 py-14 sm:py-16" style={{ background: "#FEFCFA" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold text-[#4A6741] uppercase tracking-[0.18em] mb-2">Necə işləyir</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>
              3 addımda başla
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Müəllim tap", desc: "Fənn, reytinq və qiymətə görə ən uyğun müəllimi seç.", emoji: "🔍" },
              { step: "02", title: "Rezerv et", desc: "Müəllimin mövcud saatlarından uyğun vaxtı seç.", emoji: "📅" },
              { step: "03", title: "Öyrən", desc: "Dərs keçin, bilik əldə edin, hədəflərinizə çatın.", emoji: "🎓" },
            ].map(({ step, title, desc, emoji }) => (
              <div key={step} className="relative rounded-3xl bg-white border border-[#EDE9E3] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="absolute -top-2 -left-1 font-black text-[#4A6741]/10 leading-none select-none"
                  style={{ fontFamily: "var(--font-display)", fontSize: "4rem" }}>
                  {step}
                </div>
                <div className="relative">
                  <span className="text-3xl mb-4 block">{emoji}</span>
                  <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
                  <p className="text-sm text-[#6A6560] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────── */}
      {!isAuth && (
        <section className="px-5 sm:px-8 pb-16 max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1e3320 0%,#2d4a27 45%,#4A6741 100%)" }}>
            <div className="relative overflow-hidden px-8 sm:px-16 py-14 sm:py-16 text-center">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/[0.04] blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/[0.04] blur-2xl pointer-events-none" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  Bu gün başla
                </h2>
                <p className="text-white/55 text-base sm:text-lg mb-9 max-w-lg mx-auto leading-relaxed">
                  Azərbaycanın ən yaxşı müəllimləri ilə birlikdə hədəflərinizə çatın
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link href="/register"
                    className="rounded-2xl px-8 py-3.5 text-sm font-bold text-[#4A6741] bg-white hover:bg-white/90 transition-all shadow-xl active:scale-[0.98]">
                    Pulsuz qeydiyyat
                  </Link>
                  <Link href="/login"
                    className="rounded-2xl px-8 py-3.5 text-sm font-bold text-white/75 border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/18 hover:text-white transition-all">
                    Daxil ol
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────── */}
      <footer className="border-t border-[#EDE9E3] bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}>
              <BookOpen className="size-3.5 text-white" />
            </span>
            <span className="text-sm font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-display)" }}>Academate</span>
          </div>
          <p className="text-[11px] text-[#C0BDB8]">© 2026 Academate. Bütün hüquqlar qorunur.</p>
        </div>
      </footer>
    </div>
  );
}
