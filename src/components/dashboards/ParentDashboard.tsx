"use client";

import Link from "next/link";
import { Users, UserPlus, Baby, Mail } from "lucide-react";

import { useProfile } from "@/hooks/useProfile";
import { useChildren } from "@/hooks/useChildren";

import { PageHeader, StatCard, SectionCard, ActionCard } from "./shared";

export default function ParentDashboard() {
  const { data: profile } = useProfile();
  const { data: children } = useChildren();
  const list = children ?? [];

  return (
    <div>
      <PageHeader
        title={`Salam, ${profile?.fullName?.split(" ")[0] ?? ""} 👋`}
        subtitle="Uşaqlarınızın tərəqqisini izləyin"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Uşaqlar"
          value={list.length}
          icon={Baby}
          accent="green"
        />
        <StatCard
          label="Aktiv hesablar"
          value={list.filter((c) => c.emailVerified).length}
          icon={Users}
          accent="blue"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <SectionCard
          title="Uşaqlarım"
          action={
            <Link
              href="/family/children"
              className="text-xs font-semibold text-[#4A6741] hover:underline"
            >
              Hamısı →
            </Link>
          }
        >
          {list.length === 0 ? (
            <div className="text-center py-8">
              <Baby className="size-8 text-[#B8B4AE] mx-auto mb-2" />
              <p className="text-sm text-[#7A7570] mb-3">
                Hələ uşaq əlavə etməmisiniz
              </p>
              <div className="flex gap-2 justify-center">
                <Link
                  href="/family/children/new"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl"
                  style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
                >
                  <UserPlus className="size-4" /> Yeni uşaq
                </Link>
                <Link
                  href="/family/children"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A6741] px-4 py-2 rounded-xl border border-[#E8E4DE]"
                >
                  Kodla bağla
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F2EE]">
              {list.map((c) => {
                const initials = c.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("");
                return (
                  <div key={c.id} className="py-3 flex items-center gap-4">
                    {c.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.avatarUrl}
                        alt={c.fullName}
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
                        {c.fullName}
                      </p>
                      <p className="text-[12px] text-[#7A7570]">Şagird</p>
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{
                        background: c.emailVerified ? "#F0F5EE" : "#FEF3C7",
                        color: c.emailVerified ? "#4A6741" : "#92400E",
                      }}
                    >
                      {c.emailVerified ? "Aktiv" : "Gözlənilir"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <div className="space-y-3">
          <ActionCard
            href="/family/children/new"
            title="Yeni uşaq əlavə et"
            description="Email olmadan hesab yarat"
            icon={UserPlus}
          />
          <ActionCard
            href="/family/children"
            title="Kodla bağla"
            description="Şagirddən aldığınız kod"
            icon={Mail}
          />
          <ActionCard
            href="/profile"
            title="Profil"
            description="Şəxsi məlumatlar"
            icon={Users}
          />
        </div>
      </div>
    </div>
  );
}
