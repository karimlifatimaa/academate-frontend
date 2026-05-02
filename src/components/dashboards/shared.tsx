"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Circle, Clock } from "lucide-react";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1
        className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>
      {subtitle && <p className="text-sm text-[#7A7570] mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  accent?: "green" | "amber" | "blue" | "red";
}) {
  const accentMap = {
    green: { bg: "#F0F5EE", fg: "#4A6741" },
    amber: { bg: "#FEF3C7", fg: "#92400E" },
    blue: { bg: "#DBEAFE", fg: "#1E40AF" },
    red: { bg: "#FEE2E2", fg: "#991B1B" },
  } as const;
  const c = accentMap[accent ?? "green"];
  return (
    <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7A7570]">
            {label}
          </p>
          <p className="text-3xl font-bold text-[#1A1A1A] mt-2">{value}</p>
          {hint && <p className="text-[11px] text-[#7A7570] mt-1">{hint}</p>}
        </div>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{ background: c.bg }}
        >
          <Icon className="size-5" style={{ color: c.fg }} />
        </span>
      </div>
    </div>
  );
}

export function ActionCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:border-[#4A6741]/40 hover:shadow-md transition-all flex items-start gap-4"
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 transition-transform group-hover:scale-105"
        style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
      >
        <Icon className="size-5 text-white" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#1A1A1A]">{title}</p>
        <p className="text-[12px] text-[#7A7570] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ArrowRight className="size-4 text-[#7A7570] group-hover:text-[#4A6741] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export function ChecklistItem({
  done,
  label,
  href,
  pending,
}: {
  done: boolean;
  label: string;
  href?: string;
  pending?: boolean;
}) {
  const Icon = done ? CheckCircle2 : pending ? Clock : Circle;
  const color = done
    ? "text-[#4A6741]"
    : pending
    ? "text-amber-500"
    : "text-[#B8B4AE]";
  const inner = (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-[#F8F5F0] transition-colors">
      <Icon className={`size-5 ${color} shrink-0`} />
      <span
        className={`text-sm flex-1 ${
          done ? "text-[#7A7570] line-through" : "text-[#1A1A1A] font-medium"
        }`}
      >
        {label}
      </span>
      {!done && href && (
        <ArrowRight className="size-4 text-[#7A7570] group-hover:text-[#4A6741]" />
      )}
    </div>
  );
  return href && !done ? (
    <Link href={href} className="block group">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="text-center py-8">
      <Icon className="size-8 text-[#B8B4AE] mx-auto mb-2" />
      <p className="text-sm text-[#7A7570]">{message}</p>
    </div>
  );
}
