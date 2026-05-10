"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Star, BadgeCheck, Clock,
  CalendarDays, Loader2, ChevronLeft, ChevronRight,
  MessageSquare, Sparkles,
} from "lucide-react";

import {
  useTeacherProfile,
  useTeacherAvailability,
  useTeacherReviews,
} from "@/hooks/useTeachers";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { SUBJECT_LABEL, DAY_AZ, DAY_ORDER } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

function Stars({ rating, size = "sm", white }: { rating: number; size?: "sm" | "md"; white?: boolean }) {
  const r = rating ?? 0;
  const sz = size === "md" ? "size-4" : "size-3.5";
  const filled = white ? "fill-white text-white" : "fill-amber-400 text-amber-400";
  const empty = white ? "fill-white/20 text-white/20" : "fill-gray-100 text-gray-200";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sz} ${i <= Math.round(r) ? filled : empty}`} />
      ))}
    </span>
  );
}

/* ── Page ────────────────────────────────────────── */
export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const { data: myProfile } = useProfile();
  const myRole = myProfile?.role ?? user?.role ?? "STUDENT";

  const { data: profile, isLoading } = useTeacherProfile(id);
  const { data: availability } = useTeacherAvailability(id);
  const [reviewPage, setReviewPage] = useState(0);
  const { data: reviews } = useTeacherReviews(id, reviewPage);

  const sorted = [...(availability ?? [])].sort(
    (a, b) => (DAY_ORDER[a.dayOfWeek] ?? 9) - (DAY_ORDER[b.dayOfWeek] ?? 9)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#192d18,#4A6741)" }}>
        <Loader2 className="size-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="font-semibold text-[#1A1A1A]">Müəllim tapılmadı</p>
        <button onClick={() => router.back()} className="text-sm text-[#4A6741] hover:underline">
          Geri qayıt
        </button>
      </div>
    );
  }

  const rating = profile.rating ?? 0;
  const initials = getInitials(profile.fullName);

  return (
    <div className="min-h-screen" style={{ background: "#F8F5F0" }}>

      {/* ── Hero ─────────────────────────────────── */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#192d18 0%,#2d4a27 40%,#4A6741 75%,#6B8F6E 100%)" }}>
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-white/[0.04] blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-12">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Geri
          </button>

          {/* Profile hero content */}
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white/20"
                />
              ) : (
                <div
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white/20"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
                >
                  <span className="text-4xl font-bold text-white uppercase"
                    style={{ fontFamily: "var(--font-display)" }}>
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 pt-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}>
                  {profile.fullName}
                </h1>
                {profile.isVerified && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1.5 border border-white/20 shrink-0">
                    <BadgeCheck className="size-3.5 text-[#A8CCAA]" />
                    <span className="text-[11px] font-semibold text-white">Verified Tutor</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2.5">
                <Stars rating={rating} size="md" white />
                <span className="text-white/80 text-sm font-semibold">{rating.toFixed(1)}</span>
                {reviews && reviews.totalElements > 0 && (
                  <span className="text-white/50 text-sm">({reviews.totalElements} rəy)</span>
                )}
              </div>

              {/* Subjects */}
              {profile.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((s) => (
                    <span key={s}
                      className="rounded-full px-3 py-1 text-xs font-semibold border border-white/20 bg-white/10 backdrop-blur-sm text-white/85">
                      {SUBJECT_LABEL[s] ?? s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price pill — desktop */}
            <div className="hidden sm:flex shrink-0 flex-col items-end gap-4 pt-1">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-6 py-4 text-center">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Saatlıq</p>
                <p className="text-3xl font-black text-white mt-1">
                  {profile.hourlyRate ?? "—"}
                  <span className="text-base font-semibold text-white/60"> AZN</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: main content ─────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* About */}
            <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em] mb-4">
                Haqqında
              </h2>
              {profile.bio ? (
                <p className="text-sm text-[#4A4A4A] leading-relaxed">{profile.bio}</p>
              ) : (
                <p className="text-sm text-[#B8B4AE] italic">Məlumat əlavə edilməyib</p>
              )}
            </div>

            {/* Availability */}
            <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
                  Mövcudluq Saatları
                </h2>
                <CalendarDays className="size-4 text-[#7A7570]" />
              </div>

              {sorted.length === 0 ? (
                <p className="text-sm text-[#B8B4AE] italic">Cədvəl əlavə edilməyib</p>
              ) : (
                <div className="space-y-0 divide-y divide-[#F5F2EE]">
                  {sorted.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between py-3">
                      <p className="text-[13px] font-semibold text-[#1A1A1A]">
                        {DAY_AZ[slot.dayOfWeek] ?? slot.dayOfWeek}
                      </p>
                      <div className="flex items-center gap-1.5 text-[13px] text-[#4A4A4A] font-medium">
                        <Clock className="size-3.5 text-[#7A7570]" />
                        {slot.startTime} — {slot.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
                  Şagird Rəyləri
                </h2>
                <MessageSquare className="size-4 text-[#7A7570]" />
              </div>

              {!reviews || reviews.content.length === 0 ? (
                <p className="text-sm text-[#B8B4AE] italic">Hələ rəy yoxdur</p>
              ) : (
                <div className="space-y-5">
                  {reviews.content.map((r) => (
                    <div key={r.id} className="flex gap-3">
                      {/* Student avatar */}
                      {r.studentAvatarUrl ? (
                        <img src={r.studentAvatarUrl} alt={r.studentName}
                          className="h-9 w-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
                          style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}>
                          {(r.studentName?.trim() || "?").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13px] font-semibold text-[#1A1A1A]">{r.studentName}</p>
                          <Stars rating={r.rating} />
                        </div>
                        {r.comment && (
                          <p className="text-[13px] text-[#4A4A4A] leading-relaxed mt-1.5 line-clamp-3">
                            "{r.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {(reviews.totalPages ?? 0) > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setReviewPage((p) => Math.max(0, p - 1))}
                        disabled={reviewPage === 0}
                        className="p-2 rounded-xl border border-[#E8E4DE] disabled:opacity-30 hover:bg-[#F0F5EE] transition-colors"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <span className="text-xs text-[#7A7570] font-medium">
                        {reviewPage + 1} / {reviews.totalPages}
                      </span>
                      <button
                        onClick={() => setReviewPage((p) => Math.min((reviews.totalPages ?? 1) - 1, p + 1))}
                        disabled={reviewPage >= (reviews.totalPages ?? 1) - 1}
                        className="p-2 rounded-xl border border-[#E8E4DE] disabled:opacity-30 hover:bg-[#F0F5EE] transition-colors"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sticky booking ──────────── */}
          <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24">
            <div className="rounded-3xl overflow-hidden shadow-xl shadow-[#4A6741]/15 border border-[#4A6741]/20"
              style={{ background: "linear-gradient(145deg,#2a4826,#3d5c35,#4A6741)" }}>

              {/* Price */}
              <div className="px-7 pt-7 pb-5 text-center border-b border-white/10">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Sparkles className="size-3.5 text-[#A8CCAA]" />
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">Saatlıq Qiymət</p>
                </div>
                <p className="text-4xl font-black text-white">
                  {profile.hourlyRate ?? "—"}
                  <span className="text-xl font-semibold text-white/60"> AZN</span>
                </p>
                {rating > 0 && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <Stars rating={rating} white />
                    <span className="text-white/60 text-xs">{rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="px-7 py-6 space-y-3">
                {myRole === "STUDENT" ? (
                  <button
                    onClick={() => router.push(`/teachers/${id}/book`)}
                    className="w-full py-4 rounded-2xl bg-white text-sm font-bold text-[#4A6741] hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg"
                  >
                    Dərs Rezerv Et
                  </button>
                ) : (
                  <div className="w-full py-4 rounded-2xl bg-white/10 border border-white/10 text-sm font-medium text-white/50 text-center">
                    Şagird kimi daxil olun
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  {[
                    "Pulsuz 15 dəqiqəlik məsləhət",
                    "Şəxsi tədris planı",
                    profile.isVerified ? "Təsdiqlənmiş müəllim" : "Yeni müəllim",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-white/55 text-xs">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#A8CCAA] shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
