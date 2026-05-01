"use client";

import { useState } from "react";
import { Users, Loader2, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import { toast } from "sonner";

import { useAdminUsers, useDeactivateUser } from "@/hooks/useAdmin";
import { ROLE_LABEL } from "@/lib/constants";
import type { UserRole } from "@/types/auth";

const ROLE_FILTERS: { value: UserRole | "ALL"; label: string }[] = [
  { value: "ALL", label: "Hamısı" },
  { value: "STUDENT", label: "Şagird" },
  { value: "TEACHER", label: "Müəllim" },
  { value: "PARENT", label: "Valideyn" },
];

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<UserRole | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useAdminUsers(
    filter === "ALL" ? undefined : filter,
    page,
    20
  );
  const { mutateAsync: deactivate } = useDeactivateUser();

  async function handleDeactivate(id: string, name: string) {
    if (!window.confirm(`${name} hesabını deaktiv etmək istədiyinizə əminsiniz?`)) {
      return;
    }
    try {
      await deactivate(id);
      toast.success("İstifadəçi deaktiv edildi");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Xəta baş verdi");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Users className="size-6 text-[#4A6741]" /> İstifadəçilər
        </h1>
        <p className="text-sm text-[#7A7570] mt-1">
          Bütün platforma istifadəçilərini idarə et
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {ROLE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              setFilter(value);
              setPage(0);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              filter === value
                ? "bg-[#4A6741] text-white"
                : "bg-white text-[#4A4A4A] border border-[#E2DDD5]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-white border border-[#EDE9E3] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="size-6 animate-spin text-[#4A6741]" />
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="py-16 text-center text-[#B8B4AE]">
            İstifadəçi tapılmadı
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_120px_120px] gap-4 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[#7A7570] border-b border-[#F0EDE8]">
              <span>Ad</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Email status</span>
              <span></span>
            </div>
            <div className="divide-y divide-[#F5F2EE]">
              {data.content.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr] sm:grid-cols-[1fr_1fr_120px_120px_120px] gap-2 sm:gap-4 px-4 sm:px-6 py-4 items-center"
                >
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={u.fullName}
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white uppercase shrink-0"
                        style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
                      >
                        {u.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-[#1A1A1A] truncate">
                      {u.fullName}
                    </span>
                  </div>
                  <span className="text-sm text-[#4A4A4A] truncate">{u.email}</span>
                  <span className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#F0F5EE] text-[#4A6741]">
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      u.emailVerified
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {u.emailVerified ? "Təsdiqli" : "Gözləyir"}
                  </span>
                  <button
                    onClick={() => handleDeactivate(u.id, u.fullName)}
                    className="inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors w-fit"
                  >
                    <Ban className="size-3" /> Deaktiv et
                  </button>
                </div>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0EDE8]">
                <span className="text-xs text-[#7A7570]">
                  {data.totalElements} istifadəçi · Səh {page + 1} / {data.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="p-2 rounded-lg border border-[#E8E4DE] disabled:opacity-30 hover:bg-[#F0F5EE]"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    disabled={page >= data.totalPages - 1}
                    onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                    className="p-2 rounded-lg border border-[#E8E4DE] disabled:opacity-30 hover:bg-[#F0F5EE]"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
