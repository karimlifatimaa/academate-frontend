"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Wallet,
  GraduationCap,
  Users,
  BookOpen,
  Star,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

import { useProfile } from "@/hooks/useProfile";
import { useLessons } from "@/hooks/useLessons";
import { useTeacherAvailability } from "@/hooks/useTeachers";
import { SUBJECT_LABEL } from "@/lib/constants";

import {
  PageHeader,
  StatCard,
  ChecklistItem,
  SectionCard,
  EmptyState,
  ActionCard,
} from "./shared";

export default function TeacherDashboard() {
  const { data: profile } = useProfile();
  const { data: lessonsPage } = useLessons("TEACHER");
  const teacherId = profile?.id ?? "";
  const { data: availability } = useTeacherAvailability(teacherId);

  const lessons = lessonsPage?.content ?? [];
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const todayLessons = lessons.filter((l) => {
    const t = new Date(l.scheduledAt).getTime();
    return t >= startOfToday.getTime() && t < endOfToday.getTime();
  });
  const upcoming = lessons
    .filter((l) => new Date(l.scheduledAt).getTime() >= now && (l.status === "PENDING" || l.status === "CONFIRMED"))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4);

  const pendingCount = lessons.filter((l) => l.status === "PENDING").length;
  const confirmedCount = lessons.filter((l) => l.status === "CONFIRMED").length;
  const completedCount = lessons.filter((l) => l.status === "COMPLETED").length;

  const profileComplete = !!(profile?.bio && profile?.hourlyRate && profile.hourlyRate > 0);
  const hasAvailability = (availability ?? []).length > 0;
  const isVerified = profile?.isVerified ?? false;

  const completedSteps = [profileComplete, hasAvailability, isVerified].filter(Boolean).length;
  const onboardingDone = completedSteps === 3;

  const earningsThisMonth = lessons
    .filter((l) => {
      const d = new Date(l.scheduledAt);
      const nowD = new Date();
      return (
        l.status === "COMPLETED" &&
        d.getMonth() === nowD.getMonth() &&
        d.getFullYear() === nowD.getFullYear()
      );
    })
    .reduce(
      (sum, l) => sum + (((profile?.hourlyRate ?? 0) * l.durationMinutes) / 60),
      0
    );

  return (
    <div>
      <PageHeader
        title={`Salam, ${profile?.fullName?.split(" ")[0] ?? ""} 👋`}
        subtitle="Bu gün üçün xülasəniz"
      />

      {/* Verification warning */}
      {!isVerified && (
        <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Hesabınız təsdiqlənməyib
            </p>
            <p className="text-[12px] text-amber-800 mt-0.5 leading-relaxed">
              Admin sizin profilinizi yoxlayır. Təsdiqləndikdən sonra şagirdlər sizi axtarışda
              görə biləcək. Bu vaxt ərzində profilinizi və cədvəlinizi tamamlayın.
            </p>
          </div>
        </div>
      )}

      {/* Onboarding checklist (only show if not all done) */}
      {!onboardingDone && (
        <div className="mb-5 rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
                Hesab quraşdırması
              </h2>
              <p className="text-[12px] text-[#7A7570] mt-0.5">
                {completedSteps} / 3 addım tamamlandı
              </p>
            </div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: completedSteps === 3 ? "#F0F5EE" : "#FEF3C7",
                color: completedSteps === 3 ? "#4A6741" : "#92400E",
              }}
            >
              {Math.round((completedSteps / 3) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-[#F5F2EE] rounded-full overflow-hidden mb-4">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(completedSteps / 3) * 100}%`,
                background: "linear-gradient(90deg,#4A6741,#6B8F6E)",
              }}
            />
          </div>
          <div className="space-y-1">
            <ChecklistItem
              done={profileComplete}
              label="Profili tamamla — bio və saatlıq qiymət"
              href="/profile"
            />
            <ChecklistItem
              done={hasAvailability}
              label="Mövcudluq cədvəlini qur"
              href="/availability"
            />
            <ChecklistItem
              done={isVerified}
              pending={!isVerified && profileComplete && hasAvailability}
              label="Admin tərəfindən təsdiqlənmə"
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Bu gün"
          value={todayLessons.length}
          icon={CalendarDays}
          accent="green"
        />
        <StatCard
          label="Gözləyir"
          value={pendingCount}
          icon={Clock}
          hint="təsdiq lazım"
          accent="amber"
        />
        <StatCard
          label="Təsdiqlənib"
          value={confirmedCount}
          icon={CheckCircle2}
          accent="blue"
        />
        <StatCard
          label="Bu ay gəlir"
          value={`${earningsThisMonth.toFixed(0)} AZN`}
          icon={Wallet}
          hint={`${completedCount} dərs tamamlanıb`}
          accent="green"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Upcoming lessons */}
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
            <EmptyState
              icon={CalendarDays}
              message="Yaxınlaşan dərs yoxdur"
            />
          ) : (
            <div className="divide-y divide-[#F5F2EE]">
              {upcoming.map((l) => {
                const d = new Date(l.scheduledAt);
                return (
                  <div key={l.id} className="py-3 flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 text-white"
                      style={{
                        background:
                          l.status === "CONFIRMED"
                            ? "linear-gradient(135deg,#4A6741,#6B8F6E)"
                            : "#F59E0B",
                      }}
                    >
                      <BookOpen className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                        {l.studentName}
                      </p>
                      <p className="text-[12px] text-[#7A7570]">
                        {SUBJECT_LABEL[l.subject] ?? l.subject} · {format(d, "dd MMM, HH:mm")}
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

        {/* Quick actions */}
        <div className="space-y-3">
          <ActionCard
            href="/availability"
            title="Cədvəli idarə et"
            description="Həftəlik mövcudluq saatlarınız"
            icon={Clock}
          />
          <ActionCard
            href="/profile"
            title="Profili redaktə et"
            description="Bio, qiymət, fənn siyahısı"
            icon={GraduationCap}
          />
          <ActionCard
            href="/lessons"
            title="Bütün dərslər"
            description="Statusa görə filtr et"
            icon={Users}
          />
          {profile?.rating != null && profile.rating > 0 && (
            <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 text-center">
              <Star className="size-6 fill-amber-400 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#1A1A1A]">
                {profile.rating.toFixed(1)}
              </p>
              <p className="text-[11px] text-[#7A7570] uppercase tracking-wider mt-1">
                Şagird reytinqi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
