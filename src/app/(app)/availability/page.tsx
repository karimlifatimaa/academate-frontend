"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Clock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useProfile } from "@/hooks/useProfile";
import { useMyAvailability, useUpdateAvailability } from "@/hooks/useAvailability";
import { DAY_AZ, DAYS_OF_WEEK } from "@/lib/constants";

interface SlotDraft {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export default function AvailabilityPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: existing } = useMyAvailability(profile?.id);
  const { mutateAsync, isPending } = useUpdateAvailability();

  const [slots, setSlots] = useState<SlotDraft[]>([]);

  useEffect(() => {
    if (existing) {
      setSlots(
        existing.map((s) => ({
          id: s.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime.slice(0, 5),
          endTime: s.endTime.slice(0, 5),
        }))
      );
    }
  }, [existing]);

  if (profileLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-[#4A6741]" />
      </div>
    );
  }

  if (profile && profile.role !== "TEACHER") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-[#1A1A1A] font-semibold">Bu səhifə yalnız müəllimlər üçündür</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-sm text-[#4A6741] hover:underline"
        >
          Dashboard-a qayıt
        </button>
      </div>
    );
  }

  function addSlot() {
    setSlots((s) => [
      ...s,
      { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00" },
    ]);
  }

  function removeSlot(idx: number) {
    setSlots((s) => s.filter((_, i) => i !== idx));
  }

  function update(idx: number, patch: Partial<SlotDraft>) {
    setSlots((s) => s.map((slot, i) => (i === idx ? { ...slot, ...patch } : slot)));
  }

  async function save() {
    for (const s of slots) {
      if (s.startTime >= s.endTime) {
        toast.error(`${DAY_AZ[s.dayOfWeek]}: bitmə saatı başlama saatından sonra olmalıdır`);
        return;
      }
    }
    try {
      await mutateAsync(
        slots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        }))
      );
      toast.success("Cədvəl yadda saxlanıldı");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Yadda saxlanmadı");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Mövcudluq Cədvəli
        </h1>
        <p className="text-sm text-[#7A7570] mt-1">
          Şagirdlərin sizə dərs rezerv edə biləcəyi həftəlik vaxt aralıqlarını idarə edin
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-[#EDE9E3] p-6 shadow-[0_1px_6px_rgba(0,0,0,0.04)] space-y-3">
        {slots.length === 0 ? (
          <div className="text-center py-10 text-[#B8B4AE]">
            <Clock className="size-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Hələ slot əlavə edilməyib</p>
          </div>
        ) : (
          slots.map((slot, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row gap-2 sm:items-center rounded-2xl border border-[#F0EDE8] p-3"
            >
              <select
                value={slot.dayOfWeek}
                onChange={(e) => update(idx, { dayOfWeek: e.target.value })}
                className="h-10 px-3 rounded-xl border border-[#E8E4DE] text-sm bg-white text-[#1A1A1A] focus:outline-none focus:border-[#4A6741] sm:flex-1"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {DAY_AZ[d]}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 sm:flex-1">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => update(idx, { startTime: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-[#E8E4DE] text-sm flex-1 focus:outline-none focus:border-[#4A6741]"
                />
                <span className="text-[#7A7570] text-sm">—</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => update(idx, { endTime: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-[#E8E4DE] text-sm flex-1 focus:outline-none focus:border-[#4A6741]"
                />
              </div>
              <button
                onClick={() => removeSlot(idx)}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shrink-0"
                aria-label="Sil"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}

        <button
          onClick={addSlot}
          className="w-full h-11 rounded-xl border-2 border-dashed border-[#E8E4DE] text-sm font-semibold text-[#4A6741] hover:bg-[#F0F5EE] hover:border-[#4A6741]/40 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="size-4" /> Slot əlavə et
        </button>
      </div>

      <button
        onClick={save}
        disabled={isPending}
        className="w-full sm:w-auto px-6 h-12 rounded-2xl text-sm font-bold text-white shadow-lg disabled:opacity-60 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Yadda saxla
      </button>
    </div>
  );
}
