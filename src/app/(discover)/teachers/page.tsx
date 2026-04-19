"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, BadgeCheck, Users, Search, Sparkles } from "lucide-react";

import { useTeachers } from "@/hooks/useTeachers";
import type { TeacherSearchResponse } from "@/types/profile";

/* ── Constants ───────────────────────────────────── */
const SUBJECTS: { value: string; label: string }[] = [
  { value: "RIYAZIYYAT", label: "Riyaziyyat" },
  { value: "FIZIKA", label: "Fizika" },
  { value: "KIMYA", label: "Kimya" },
  { value: "BIOLOGIYA", label: "Biologiya" },
  { value: "INFORMATIKA", label: "İnformatika" },
  { value: "AZERBAYCAN_DILI", label: "Azərbaycan dili" },
  { value: "EDEBIYYAT", label: "Ədəbiyyat" },
  { value: "INGILIS_DILI", label: "İngilis dili" },
  { value: "TARIX", label: "Tarix" },
  { value: "COGRAFIYA", label: "Coğrafiya" },
];

const SUBJECT_LABEL: Record<string, string> = Object.fromEntries(
  SUBJECTS.map(({ value, label }) => [value, label])
);

/* ── Avatar ──────────────────────────────────────── */
function CardAvatar({ name, url }: { name?: string | null; url?: string | null }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name ?? ""}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    );
  }
  const safe = name?.trim() || "?";
  const parts = safe.split(" ");
  const initials =
    parts.length >= 2
      ? (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
      : safe.slice(0, 2);
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: "linear-gradient(145deg,#2d4a27,#4A6741,#7aaa7d)" }}>
      <span className="text-4xl font-bold text-white/90 uppercase select-none"
        style={{ fontFamily: "var(--font-display)" }}>
        {initials}
      </span>
    </div>
  );
}

/* ── Teacher Card ─────────────────────────────────── */
function TeacherCard({ teacher, index }: { teacher: TeacherSearchResponse; index: number }) {
  const rating = teacher.rating ?? 0;

  return (
    <Link
      href={`/teachers/${teacher.id}`}
      className="group block rounded-3xl bg-white overflow-hidden border border-[#EDE9E3] hover:shadow-2xl hover:shadow-[#4A6741]/10 hover:-translate-y-1.5 transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <CardAvatar name={teacher.fullName} url={teacher.avatarUrl} />

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Rating pill — top right */}
        {rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-[#1A1A1A]">{rating.toFixed(1)}</span>
            {teacher.reviewCount > 0 && (
              <span className="text-[10px] text-[#7A7570]">({teacher.reviewCount})</span>
            )}
          </div>
        )}

        {/* Verified badge — top left */}
        {teacher.isVerified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{ background: "rgba(74,103,65,0.92)", backdropFilter: "blur(8px)" }}>
            <BadgeCheck className="size-3.5 text-white" />
            <span className="text-[10px] font-semibold text-white">Verified</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        {/* Name */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#1A1A1A] group-hover:text-[#4A6741] transition-colors leading-snug"
            style={{ fontFamily: "var(--font-display)" }}>
            {teacher.fullName}
          </h3>
          {teacher.bio && (
            <p className="text-xs text-[#7A7570] mt-1.5 line-clamp-2 leading-relaxed">
              {teacher.bio}
            </p>
          )}
        </div>

        {/* Subject tags */}
        <div className="flex flex-wrap gap-1.5">
          {teacher.subjects.slice(0, 3).map((s) => (
            <span key={s}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#F0F5EE] text-[#4A6741] border border-[#D4E5D0]">
              {SUBJECT_LABEL[s] ?? s}
            </span>
          ))}
          {teacher.subjects.length > 3 && (
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-[#F5F4F2] text-[#7A7570]">
              +{teacher.subjects.length - 3}
            </span>
          )}
        </div>

        {/* Price + divider */}
        <div className="pt-2 border-t border-[#F5F2EE] flex items-center justify-between">
          <span className="text-[11px] text-[#7A7570]">
            {teacher.reviewCount > 0 ? `${teacher.reviewCount} rəy` : "Rəy yoxdur"}
          </span>
          {teacher.hourlyRate != null ? (
            <div className="text-right">
              <span className="text-[15px] font-bold text-[#4A6741]">{teacher.hourlyRate}</span>
              <span className="text-[11px] text-[#7A7570]"> AZN/saat</span>
            </div>
          ) : (
            <span className="text-[11px] text-[#B8B4AE]">Qiymət yoxdur</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Skeleton ────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-[#EDE9E3] overflow-hidden animate-pulse">
      <div className="bg-[#F0EDE8]" style={{ aspectRatio: "4/3" }} />
      <div className="p-5 space-y-3">
        <div className="h-4 w-36 bg-[#F0EDE8] rounded-lg" />
        <div className="h-3 w-full bg-[#F0EDE8] rounded-lg" />
        <div className="h-3 w-2/3 bg-[#F0EDE8] rounded-lg" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-[#F0EDE8] rounded-full" />
          <div className="h-5 w-14 bg-[#F0EDE8] rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────── */
export default function TeachersPage() {
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useTeachers(subject, page);

  const handleSubject = (val: string | undefined) => {
    setSubject(val);
    setPage(0);
  };

  const teachers = (data?.content ?? []).filter((t) =>
    !search.trim() ? true : t.fullName.toLowerCase().includes(search.toLowerCase())
  );
  const hasMore = page < (data?.totalPages ?? 0) - 1;

  return (
    <div className="min-h-screen" style={{ background: "#F8F5F0" }}>

      {/* ── Hero ─────────────────────────────────── */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#192d18 0%,#2a4826 35%,#4A6741 68%,#688f6b 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/[0.04] blur-2xl" />
          <div className="absolute top-0 left-1/4 h-px w-px"
            style={{
              boxShadow: "0 0 200px 80px rgba(255,255,255,0.04)",
            }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 mb-6">
            <Sparkles className="size-3.5 text-[#A8CCAA]" />
            <span className="text-[11px] font-semibold text-white/80 tracking-wide uppercase">Peşəkar Müəllimlər</span>
          </div>

          <h1 className="text-4xl sm:text-[3.5rem] font-bold text-white leading-[1.05] tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}>
            Doğru müəllimi tapın,
            <br />
            <span className="text-[#A8CCAA]">hədəflərinizə çatın</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Azərbaycanın ən yaxşı müəllimləri ilə birlikdə öyrənin
          </p>

          {/* Search bar */}
          <div className="flex items-center gap-2 max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2 flex-1 pl-3">
              <Search className="size-4 text-[#7A7570] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Müəllim adı ilə axtarın..."
                className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#B8B4AE] outline-none py-2"
              />
            </div>
            <button
              className="shrink-0 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
            >
              Axtar
            </button>
          </div>

          {/* Stats */}
          {data && (
            <p className="mt-6 text-white/40 text-sm">
              <span className="text-white/80 font-semibold">{data.totalElements}</span> müəllim mövcuddur
            </p>
          )}
        </div>
      </div>

      {/* ── Subject Filter Bar (sticky) ─────────── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#EDE9E3] shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-2.5 overflow-x-auto scrollbar-none">
          {[{ value: undefined, label: "Hamısı" }, ...SUBJECTS].map(({ value, label }) => {
            const active = subject === value;
            return (
              <button
                key={value ?? "all"}
                onClick={() => handleSubject(value)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium border transition-all duration-150 whitespace-nowrap ${
                  active
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm"
                    : "bg-white text-[#4A4A4A] border-[#E2DDD5] hover:border-[#4A6741] hover:text-[#4A6741] hover:bg-[#F9FBF8]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">

        {/* Results count */}
        {!isLoading && data && (
          <div className="flex items-center gap-4 mb-7">
            <p className="text-[13px] text-[#7A7570]">
              <span className="font-semibold text-[#1A1A1A]">{teachers.length}</span> müəllim
              {subject && ` · ${SUBJECT_LABEL[subject]}`}
              {search.trim() && ` · "${search}"`}
            </p>
            <div className="h-px flex-1 bg-[#EDE9E3]" />
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl mb-5"
              style={{ background: "linear-gradient(135deg,#F0F5EE,#E5EEE3)" }}>
              <Users className="size-9 text-[#4A6741]" />
            </div>
            <p className="text-lg font-semibold text-[#1A1A1A]">Müəllim tapılmadı</p>
            <p className="text-sm text-[#7A7570] mt-2">Digər fənn filtrini sınayın</p>
            <button
              onClick={() => { setSubject(undefined); setSearch(""); }}
              className="mt-5 rounded-xl border border-[#E8E4DE] bg-white px-5 py-2 text-sm font-medium text-[#4A4A4A] hover:border-[#4A6741] hover:text-[#4A6741] transition-all"
            >
              Filtrləri sıfırla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {teachers.map((t, i) => (
              <TeacherCard key={t.id} teacher={t} index={i} />
            ))}
          </div>
        )}

        {/* Load more */}
        {!isLoading && hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-2xl border border-[#E8E4DE] bg-white px-10 py-3 text-[13px] font-semibold text-[#4A4A4A] hover:border-[#4A6741] hover:text-[#4A6741] hover:bg-[#F9FBF8] transition-all shadow-sm"
            >
              Daha çox yüklə
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
