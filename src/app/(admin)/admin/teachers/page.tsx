"use client";

import { useState } from "react";
import {
  GraduationCap,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Ban,
  Star,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAdminTeachers,
  useVerifyTeacher,
  useDeactivateUser,
} from "@/hooks/useAdmin";
import { SUBJECT_LABEL } from "@/lib/constants";

export default function AdminTeachersPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAdminTeachers(page, 20);
  const { mutateAsync: verify } = useVerifyTeacher();
  const { mutateAsync: deactivate } = useDeactivateUser();

  async function handleVerify(id: string, name: string) {
    if (!window.confirm(`${name} müəllimini təsdiqləmək istədiyinizə əminsiniz?`)) {
      return;
    }
    try {
      await verify(id);
      toast.success("Müəllim təsdiqləndi");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Xəta baş verdi");
    }
  }

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
          <GraduationCap className="size-6 text-[#4A6741]" /> Müəllimlər
        </h1>
        <p className="text-sm text-[#7A7570] mt-1">
          Müəllimləri təsdiqləyin və hesabları idarə edin
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="size-6 animate-spin text-[#4A6741]" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="py-16 text-center text-[#B8B4AE]">Müəllim tapılmadı</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.content.map((t) => (
              <div
                key={t.userId}
                className="rounded-2xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-start gap-3 mb-4">
                  {t.avatarUrl ? (
                    <img
                      src={t.avatarUrl}
                      alt={t.fullName}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                  ) : (
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
                    >
                      {t.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-[#1A1A1A] truncate">
                        {t.fullName}
                      </p>
                      {t.isVerified && (
                        <BadgeCheck className="size-4 text-[#4A6741]" />
                      )}
                    </div>
                    <p className="text-xs text-[#7A7570] truncate">{t.email}</p>
                    {t.phone && (
                      <p className="text-xs text-[#B8B4AE] truncate">{t.phone}</p>
                    )}
                  </div>
                  {typeof t.rating === "number" && t.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs text-[#4A4A4A]">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {t.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {t.subjects && t.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {t.subjects.map((s) => (
                      <span
                        key={s}
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#F0F5EE] text-[#4A6741]"
                      >
                        {SUBJECT_LABEL[s] ?? s}
                      </span>
                    ))}
                  </div>
                )}

                {!t.isVerified && (
                  <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                        t.profileComplete
                          ? "bg-[#F0F5EE] text-[#4A6741] border-[#D4E5D0]"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {t.profileComplete ? "✓" : "○"} Profil
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                        t.availabilityComplete
                          ? "bg-[#F0F5EE] text-[#4A6741] border-[#D4E5D0]"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {t.availabilityComplete ? "✓" : "○"} Cədvəl
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  {!t.isVerified && (() => {
                    const ready = (t.profileComplete ?? false) && (t.availabilityComplete ?? false);
                    const reason = !t.profileComplete
                      ? "Profil yarımçıq"
                      : !t.availabilityComplete
                      ? "Cədvəl qurulmayıb"
                      : "";
                    return (
                      <button
                        onClick={() => handleVerify(t.userId, t.fullName)}
                        disabled={!ready}
                        title={!ready ? reason : ""}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
                      >
                        {ready ? (
                          <BadgeCheck className="size-3.5" />
                        ) : (
                          <AlertCircle className="size-3.5" />
                        )}
                        {ready ? "Təsdiqlə" : reason}
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => handleDeactivate(t.userId, t.fullName)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 h-9 rounded-xl border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Ban className="size-3.5" /> Deaktiv et
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-[#7A7570]">
                {data.totalElements} müəllim · Səh {page + 1} / {data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-2 rounded-lg border border-[#E8E4DE] disabled:opacity-30 hover:bg-[#F0F5EE] bg-white"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  disabled={page >= data.totalPages - 1}
                  onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                  className="p-2 rounded-lg border border-[#E8E4DE] disabled:opacity-30 hover:bg-[#F0F5EE] bg-white"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
