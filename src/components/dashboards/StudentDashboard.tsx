"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  BookOpen,
  Search,
  BadgeCheck,
  Star,
} from "lucide-react";
import { format } from "date-fns";

import { useProfile } from "@/hooks/useProfile";
import { useLessons } from "@/hooks/useLessons";
import { useTeachers } from "@/hooks/useTeachers";
import { SUBJECT_LABEL } from "@/lib/constants";

import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
  ActionCard,
} from "./shared";

export default function StudentDashboard() {
  const { data: profile } = useProfile();
  const { data: lessonsPage } = useLessons("STUDENT");
  const { data: teachersPage } = useTeachers(undefined, 0, 4);

  const lessons = lessonsPage?.content ?? [];
  const now = Date.now();

  const upcoming = lessons
    .filter(
      (l) =>
        new Date(l.scheduledAt).getTime() >= now &&
        (l.status === "PENDING" || l.status === "CONFIRMED")
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
    .slice(0, 4);

  const pendingCount = lessons.filter((l) => l.status === "PENDING").length;
  const confirmedCount = lessons.filter((l) => l.status === "CONFIRMED").length;
  const completedCount = lessons.filter((l) => l.status === "COMPLETED").length;

  return (
    <div>
      <PageHeader
        title={`Salam, ${profile?.fullName?.split(" ")[0] ?? ""} 👋`}
        subtitle="Bu gün nə öyrənək?"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Yaxınlaşan"
          value={upcoming.length}
          icon={CalendarDays}
          accent="green"
        />
        <StatCard
          label="Gözləyir"
          value={pendingCount}
          icon={Clock}
          hint="müəllim təsdiqi"
          accent="amber"
        />
        <StatCard
          label="Təsdiqli"
          value={confirmedCount}
          icon={CheckCircle2}
          accent="blue"
        />
        <StatCard
          label="Tamamlandı"
          value={completedCount}
          icon={BookOpen}
          accent="green"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Upcoming lessons */}
        <div className="space-y-5">
          <SectionCard
            title="Yaxınlaşan dərslər"
            action={
              <Link
                href="/lessons"
                className="text-xs font-semibold text-[#4A6741] hover:underline"
              >
                Hamısı →
              </Link>
            }
          >
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="size-8 text-[#B8B4AE] mx-auto mb-2" />
                <p className="text-sm text-[#7A7570] mb-3">
                  Hələ planlaşdırılmış dərsiniz yoxdur
                </p>
                <Link
                  href="/teachers"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl"
                  style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
                >
                  <Search className="size-4" /> Müəllim tap
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F5F2EE]">
                {upcoming.map((l) => {
                  const d = new Date(l.scheduledAt);
                  return (
                    <div key={l.id} className="py-3 flex items-center gap-4">
                      {l.teacherAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.teacherAvatarUrl}
                          alt={l.teacherName}
                          className="h-12 w-12 rounded-2xl object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white text-sm font-bold"
                          style={{
                            background: "linear-gradient(135deg,#4A6741,#6B8F6E)",
                          }}
                        >
                          {(l.teacherName ?? "?").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                          {l.teacherName}
                        </p>
                        <p className="text-[12px] text-[#7A7570]">
                          {SUBJECT_LABEL[l.subject] ?? l.subject} ·{" "}
                          {format(d, "dd MMM, HH:mm")}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{
                          background: l.status === "CONFIRMED" ? "#F0F5EE" : "#FEF3C7",
                          color: l.status === "CONFIRMED" ? "#4A6741" : "#92400E",
                        }}
                      >
                        {l.status === "CONFIRMED" ? "Təsdiqli" : "Gözləyir"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Recommended teachers */}
          <SectionCard
            title="Tövsiyə olunan müəllimlər"
            action={
              <Link
                href="/teachers"
                className="text-xs font-semibold text-[#4A6741] hover:underline"
              >
                Hamısı →
              </Link>
            }
          >
            {(teachersPage?.content ?? []).length === 0 ? (
              <EmptyState icon={GraduationCap} message="Müəllim tapılmadı" />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {(teachersPage?.content ?? []).slice(0, 4).map((t) => (
                  <Link
                    key={t.id}
                    href={`/teachers/${t.id}`}
                    className="rounded-2xl border border-[#EDE9E3] p-4 hover:border-[#4A6741]/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {t.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.avatarUrl}
                          alt={t.fullName}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-xs font-bold"
                          style={{
                            background: "linear-gradient(135deg,#4A6741,#6B8F6E)",
                          }}
                        >
                          {t.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                            {t.fullName}
                          </p>
                          {t.isVerified && (
                            <BadgeCheck className="size-3.5 text-[#4A6741] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#7A7570]">
                          {t.hourlyRate} AZN/saat
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {(t.subjects ?? []).slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F5EE] text-[#4A6741] font-medium"
                          >
                            {SUBJECT_LABEL[s] ?? s}
                          </span>
                        ))}
                      </div>
                      {t.rating > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-[#7A7570]">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          {t.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <ActionCard
            href="/teachers"
            title="Müəllim tap"
            description="Fənn üzrə müəllim axtar"
            icon={Search}
          />
          <ActionCard
            href="/lessons"
            title="Dərslərim"
            description="Bütün rezervlər"
            icon={CalendarDays}
          />
          <ActionCard
            href="/family/invite-code"
            title="Valideyn dəvət kodu"
            description="Valideyninizi hesabınıza bağlayın"
            icon={GraduationCap}
          />
        </div>
      </div>
    </div>
  );
}
