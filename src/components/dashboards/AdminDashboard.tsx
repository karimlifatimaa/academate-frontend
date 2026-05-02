"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  Baby,
  BadgeCheck,
  ShieldAlert,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useProfile } from "@/hooks/useProfile";
import { useAdminStats, useAdminTeachers, useVerifyTeacher } from "@/hooks/useAdmin";
import { toast } from "sonner";

import { PageHeader, StatCard, SectionCard, ActionCard } from "./shared";

export default function AdminDashboard() {
  const { data: profile } = useProfile();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: teachersPage } = useAdminTeachers(0, 20);
  const verify = useVerifyTeacher();

  const pendingList = (teachersPage?.content ?? [])
    .filter((t) => !t.isVerified)
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Salam, ${profile?.fullName?.split(" ")[0] ?? "Admin"} 👋`}
        subtitle="Platforma idarəetmə paneli"
      />

      {/* Pending teachers banner */}
      {(stats?.pendingTeachers ?? 0) > 0 && (
        <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <ShieldAlert className="size-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              {stats!.pendingTeachers} müəllim təsdiq gözləyir
            </p>
          </div>
          <Link
            href="/admin/teachers"
            className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
          >
            Yoxla <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Bütün istifadəçilər"
          value={statsLoading ? "—" : stats?.totalUsers ?? 0}
          icon={Users}
          accent="green"
        />
        <StatCard
          label="Şagirdlər"
          value={statsLoading ? "—" : stats?.totalStudents ?? 0}
          icon={Baby}
          accent="blue"
        />
        <StatCard
          label="Müəllimlər"
          value={statsLoading ? "—" : stats?.totalTeachers ?? 0}
          icon={GraduationCap}
          hint={stats ? `${stats.verifiedTeachers} təsdiqli` : undefined}
          accent="green"
        />
        <StatCard
          label="Gözləyən təsdiq"
          value={statsLoading ? "—" : stats?.pendingTeachers ?? 0}
          icon={ShieldAlert}
          accent={stats?.pendingTeachers ? "amber" : "green"}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <SectionCard
          title="Təsdiq gözləyən müəllimlər"
          action={
            <Link
              href="/admin/teachers"
              className="text-xs font-semibold text-[#4A6741] hover:underline"
            >
              Hamısı →
            </Link>
          }
        >
          {pendingList.length === 0 ? (
            <div className="text-center py-8">
              <BadgeCheck className="size-8 text-[#4A6741] mx-auto mb-2" />
              <p className="text-sm text-[#7A7570]">Hər kəs təsdiqlənib 🎉</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F2EE]">
              {pendingList.map((t) => {
                const initials = t.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("");
                const isPending = verify.isPending && verify.variables === t.userId;
                return (
                  <div key={t.userId} className="py-3 flex items-center gap-4">
                    {t.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.avatarUrl}
                        alt={t.fullName}
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white text-sm font-bold uppercase"
                        style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                        {t.fullName}
                      </p>
                      <p className="text-[12px] text-[#7A7570] truncate">{t.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        verify.mutate(t.userId, {
                          onSuccess: () => toast.success("Müəllim təsdiqləndi"),
                          onError: () => toast.error("Təsdiq alınmadı"),
                        });
                      }}
                      disabled={isPending}
                      className="text-xs font-bold text-white px-3 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                      style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
                    >
                      {isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <BadgeCheck className="size-3.5" />
                      )}
                      Təsdiqlə
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <div className="space-y-3">
          <ActionCard
            href="/admin/teachers"
            title="Müəllimlər"
            description="Hamısı, təsdiqləmə, deaktivasiya"
            icon={GraduationCap}
          />
          <ActionCard
            href="/admin/users"
            title="Bütün istifadəçilər"
            description="Rola görə filtr et"
            icon={Users}
          />
        </div>
      </div>
    </div>
  );
}
