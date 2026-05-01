"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Info,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import {
  useTeacherProfile,
  useTeacherAvailability,
  useTeacherBookedTimes,
} from "@/hooks/useTeachers";
import { useLessons } from "@/hooks/useLessons";
import { useBookLesson } from "@/hooks/useBooking";
import { useProfile } from "@/hooks/useProfile";
import { SUBJECT_LABEL } from "@/lib/constants";
import { buildDayStrip, generateSlotsForDate, type TimeSlot } from "@/lib/slots";

const DURATIONS = [
  { value: 60, label: "60 dəq" },
  { value: 90, label: "90 dəq" },
  { value: 120, label: "120 dəq" },
];

export default function BookLessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: myProfile, isLoading: profileLoading } = useProfile();
  const { data: teacher, isLoading: teacherLoading } = useTeacherProfile(id);
  const { data: availability, isLoading: availLoading } = useTeacherAvailability(id);
  const { data: myLessonsPage } = useLessons("STUDENT");
  const { mutateAsync: book, isPending } = useBookLesson();

  const days = useMemo(() => buildDayStrip(14), []);
  const fromIso = days[0]?.iso;
  const toIso = days[days.length - 1]?.iso;
  const { data: bookedTimes } = useTeacherBookedTimes(id, fromIso, toIso);

  const [selectedDayIso, setSelectedDayIso] = useState(days[0]?.iso ?? "");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");

  const selectedDay = days.find((d) => d.iso === selectedDayIso) ?? days[0];

  const slots = useMemo(() => {
    if (!availability || !selectedDay) return [];
    return generateSlotsForDate(
      selectedDay.date,
      availability,
      myLessonsPage?.content ?? [],
      bookedTimes ?? [],
      duration,
      60
    );
  }, [availability, selectedDay, myLessonsPage, bookedTimes, duration]);

  if (profileLoading || teacherLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-[#4A6741]" />
      </div>
    );
  }

  if (myProfile && myProfile.role !== "STUDENT") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-[#1A1A1A] font-semibold">Yalnız şagirdlər dərs rezerv edə bilər</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-sm text-[#4A6741] hover:underline"
        >
          Dashboard-a qayıt
        </button>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-[#1A1A1A] font-semibold">Müəllim tapılmadı</p>
      </div>
    );
  }

  async function handleSubmit() {
    if (!subject) {
      toast.error("Fənn seçin");
      return;
    }
    if (!selectedSlot) {
      toast.error("Boş vaxt seçin");
      return;
    }
    try {
      await book({
        teacherId: id,
        subject,
        scheduledAt: selectedSlot.iso,
        durationMinutes: duration,
        notes: notes.trim() || undefined,
      });
      toast.success("Dərs uğurla rezerv edildi! Müəllim təsdiqlədikdən sonra bildiriş gələcək.");
      router.push("/lessons");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Rezervasiya uğursuz oldu");
    }
  }

  const initials = teacher.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-medium text-[#7A7570] hover:text-[#4A6741] transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> Geri
      </button>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* ── Left: pickers ─────────────────────── */}
        <div className="space-y-5">
          {/* Teacher header */}
          <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] flex items-center gap-4">
            {teacher.avatarUrl ? (
              <img
                src={teacher.avatarUrl}
                alt={teacher.fullName}
                className="h-14 w-14 rounded-2xl object-cover"
              />
            ) : (
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
              >
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1
                className="text-lg sm:text-xl font-bold text-[#1A1A1A]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {teacher.fullName}
              </h1>
              <p className="text-sm text-[#7A7570]">
                {teacher.hourlyRate ?? "—"} AZN / saat
              </p>
            </div>
          </div>

          {/* Subject */}
          <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em] mb-3">
              Fənn
            </h2>
            {(teacher.subjects ?? []).length === 0 ? (
              <p className="text-sm text-[#B8B4AE] italic">
                Müəllim hələ fənn təyin etməyib
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(teacher.subjects ?? []).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      subject === s
                        ? "bg-[#4A6741] text-white border-[#4A6741]"
                        : "bg-white text-[#4A4A4A] border-[#E8E4DE] hover:border-[#4A6741]/40"
                    }`}
                  >
                    {SUBJECT_LABEL[s] ?? s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em] mb-3">
              Müddət
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => {
                    setDuration(d.value);
                    setSelectedSlot(null);
                  }}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    duration === d.value
                      ? "bg-[#4A6741] text-white border-[#4A6741]"
                      : "bg-white text-[#4A4A4A] border-[#E8E4DE] hover:border-[#4A6741]/40"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day strip */}
          <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
                Tarix
              </h2>
              <CalendarDays className="size-4 text-[#7A7570]" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {days.map((d) => {
                const active = d.iso === selectedDayIso;
                return (
                  <button
                    type="button"
                    key={d.iso}
                    onClick={() => {
                      setSelectedDayIso(d.iso);
                      setSelectedSlot(null);
                    }}
                    className={`shrink-0 w-[72px] py-3 rounded-2xl text-center transition-all border ${
                      active
                        ? "bg-[#4A6741] text-white border-[#4A6741] shadow-md"
                        : "bg-white text-[#4A4A4A] border-[#E8E4DE] hover:border-[#4A6741]/40"
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-white/70" : "text-[#7A7570]"}`}>
                      {d.label || d.weekdayShort}
                    </div>
                    <div className="text-lg font-bold mt-0.5">{d.dayNumber}</div>
                    <div className={`text-[10px] ${active ? "text-white/70" : "text-[#7A7570]"}`}>
                      {d.monthShort}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots */}
          <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em] mb-3">
              Boş vaxtlar
            </h2>
            {availLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="size-5 animate-spin text-[#4A6741]" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#7A7570]">
                  Bu gün üçün müəllim mövcud deyil
                </p>
                <p className="text-[12px] text-[#B8B4AE] mt-1">Başqa gün seçin</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => {
                    const active = selectedSlot?.iso === slot.iso;
                    const tooltip =
                      slot.reason === "MY_BOOKING"
                        ? "Bu vaxt sizin başqa dərsiniz var"
                        : slot.reason === "BOOKED"
                        ? "Başqa şagird tərəfindən rezerv edilib"
                        : slot.reason === "PAST"
                        ? "Keçmiş vaxt"
                        : undefined;

                    let cls =
                      "bg-white text-[#4A4A4A] border-[#E8E4DE] hover:border-[#4A6741] hover:text-[#4A6741]";
                    if (active) {
                      cls =
                        "bg-[#4A6741] text-white border-[#4A6741] shadow-md";
                    } else if (slot.reason === "BOOKED") {
                      cls =
                        "bg-red-50 text-red-400 border-red-100 cursor-not-allowed line-through";
                    } else if (slot.disabled) {
                      cls =
                        "bg-[#F5F2EE] text-[#B8B4AE] border-[#F0EDE8] cursor-not-allowed line-through";
                    }

                    return (
                      <button
                        type="button"
                        key={slot.iso}
                        disabled={slot.disabled}
                        onClick={() => setSelectedSlot(slot)}
                        title={tooltip}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${cls}`}
                      >
                        {slot.hhmm}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-[#7A7570]">
                  <LegendDot color="#4A6741" label="Seçildi" />
                  <LegendDot color="#FFFFFF" border label="Boş" />
                  <LegendDot color="#FEE2E2" label="Rezerv olunub" />
                  <LegendDot color="#F5F2EE" label="Keçmiş / sizin dərs" />
                </div>
              </>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F0F5EE] border border-[#D4E5D0] p-3">
              <Info className="size-3.5 text-[#4A6741] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#4A6741] leading-relaxed">
                Slotlar müəllimin həftəlik mövcudluq cədvəlinə əsasən göstərilir. Qırmızı slotlar
                başqa şagird tərəfindən rezerv olunub. Müəllim sizin seçdiyiniz vaxtı təsdiqləyəcək.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em] mb-3">
              Qeydlər (məcburi deyil)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Müəllim üçün xüsusi mövzu və ya istəkləriniz..."
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8E4DE] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#4A6741] resize-none"
            />
            <p className="text-[11px] text-[#B8B4AE] mt-1">{notes.length} / 500</p>
          </div>
        </div>

        {/* ── Right: summary ──────────────────── */}
        <div className="lg:sticky lg:top-24 self-start">
          <div
            className="rounded-3xl overflow-hidden shadow-xl shadow-[#4A6741]/15 border border-[#4A6741]/20 text-white"
            style={{ background: "linear-gradient(145deg,#2a4826,#3d5c35,#4A6741)" }}
          >
            <div className="px-6 pt-6 pb-4 border-b border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1">
                Rezervasiya
              </p>
              <p className="text-2xl font-bold">{teacher.fullName}</p>
            </div>

            <div className="px-6 py-4 space-y-3 text-sm">
              <SummaryRow
                label="Fənn"
                value={subject ? SUBJECT_LABEL[subject] ?? subject : "—"}
              />
              <SummaryRow
                label="Tarix"
                value={
                  selectedDay
                    ? `${selectedDay.dayNumber} ${selectedDay.monthShort}`
                    : "—"
                }
              />
              <SummaryRow
                label="Saat"
                value={selectedSlot ? selectedSlot.hhmm : "—"}
              />
              <SummaryRow label="Müddət" value={`${duration} dəq`} />
              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/60">Təxmini qiymət</span>
                <span className="text-xl font-bold">
                  {teacher.hourlyRate
                    ? ((teacher.hourlyRate * duration) / 60).toFixed(2)
                    : "—"}{" "}
                  AZN
                </span>
              </div>
            </div>

            <div className="px-6 py-5">
              <button
                onClick={handleSubmit}
                disabled={isPending || !subject || !selectedSlot}
                className="w-full h-12 rounded-2xl bg-white text-sm font-bold text-[#4A6741] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/95 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <BookOpen className="size-4" />
                )}
                Dərsi rezerv et
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/60">{label}</span>
      <span className="font-semibold text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}

function LegendDot({
  color,
  label,
  border,
}: {
  color: string;
  label: string;
  border?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded"
        style={{
          background: color,
          border: border ? "1px solid #E8E4DE" : undefined,
        }}
      />
      {label}
    </span>
  );
}
