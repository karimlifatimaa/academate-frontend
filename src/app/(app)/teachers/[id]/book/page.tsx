"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Info,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
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
import {
  buildDayStrip,
  generateSlotsForDate,
  type DayOption,
  type TimeSlot,
} from "@/lib/slots";
import type { AvailabilitySlot } from "@/types/profile";

const DURATIONS = [
  { value: 60, label: "60 dəq" },
  { value: 90, label: "90 dəq" },
  { value: 120, label: "120 dəq" },
];

const JS_DAY_TO_NAME = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const PAGE_SIZE = 7;

function dayHasAvailability(date: Date, availability: AvailabilitySlot[]) {
  const dayName = JS_DAY_TO_NAME[date.getDay()];
  return availability.some((a) => a.dayOfWeek === dayName);
}

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

  const [dayPage, setDayPage] = useState(0);
  const [selectedDayIso, setSelectedDayIso] = useState(days[0]?.iso ?? "");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");

  const subjects = teacher?.subjects ?? [];
  // Auto-select if there is exactly one subject
  useEffect(() => {
    if (subjects.length === 1 && !subject) {
      setSubject(subjects[0]);
    }
  }, [subjects, subject]);

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

  // Find next day with at least one usable slot — for the empty state hint.
  const nextAvailableDay = useMemo<DayOption | null>(() => {
    if (!availability || availability.length === 0) return null;
    const startIdx = days.findIndex((d) => d.iso === selectedDayIso);
    for (let i = startIdx + 1; i < days.length; i++) {
      const d = days[i];
      if (!dayHasAvailability(d.date, availability)) continue;
      const candidateSlots = generateSlotsForDate(
        d.date,
        availability,
        myLessonsPage?.content ?? [],
        bookedTimes ?? [],
        duration,
        60
      );
      if (candidateSlots.some((s) => !s.disabled)) return d;
    }
    return null;
  }, [availability, days, selectedDayIso, myLessonsPage, bookedTimes, duration]);

  const visibleDays = days.slice(dayPage * PAGE_SIZE, (dayPage + 1) * PAGE_SIZE);
  const totalDayPages = Math.ceil(days.length / PAGE_SIZE);

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

  function jumpToDay(iso: string) {
    setSelectedDayIso(iso);
    setSelectedSlot(null);
    const idx = days.findIndex((d) => d.iso === iso);
    if (idx >= 0) setDayPage(Math.floor(idx / PAGE_SIZE));
  }

  const initials = teacher.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  const subjectLabel = subject ? SUBJECT_LABEL[subject] ?? subject : "—";
  const totalPrice = teacher.hourlyRate
    ? ((teacher.hourlyRate * duration) / 60).toFixed(2)
    : "—";
  const dateLabel = selectedDay ? `${selectedDay.dayNumber} ${selectedDay.monthShort}` : "—";
  const timeLabel = selectedSlot ? selectedSlot.hhmm : "—";
  const canSubmit = !!subject && !!selectedSlot && !isPending;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-medium text-[#7A7570] hover:text-[#4A6741] transition-colors mb-6"
      >
        <ArrowLeft className="size-4" /> Geri
      </button>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* ── Left: pickers ─────────────────────── */}
        <div className="space-y-5 min-w-0">
          {/* Teacher header */}
          <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] flex items-center gap-4">
            {teacher.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
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
                className="text-lg sm:text-xl font-bold text-[#1A1A1A] truncate"
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
                Fənn
              </h2>
              {subject && (
                <CheckCircle2 className="size-4 text-[#4A6741]" />
              )}
            </div>
            {subjects.length === 0 ? (
              <p className="text-sm text-[#B8B4AE] italic">
                Müəllim hələ fənn təyin etməyib
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                      subject === s
                        ? "bg-[#4A6741] text-white border-[#4A6741] shadow-sm"
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
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    duration === d.value
                      ? "bg-[#4A6741] text-white border-[#4A6741] shadow-sm"
                      : "bg-white text-[#4A4A4A] border-[#E8E4DE] hover:border-[#4A6741]/40"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day strip with pagination */}
          <div className="rounded-3xl bg-white border border-[#EDE9E3] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-[#7A7570]" />
                <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
                  Tarix
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDayPage((p) => Math.max(0, p - 1))}
                  disabled={dayPage === 0}
                  className="p-1.5 rounded-lg border border-[#E8E4DE] hover:bg-[#F0F5EE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Əvvəlki həftə"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-[11px] text-[#7A7570] px-2 font-medium tabular-nums">
                  {dayPage + 1} / {totalDayPages}
                </span>
                <button
                  type="button"
                  onClick={() => setDayPage((p) => Math.min(totalDayPages - 1, p + 1))}
                  disabled={dayPage >= totalDayPages - 1}
                  className="p-1.5 rounded-lg border border-[#E8E4DE] hover:bg-[#F0F5EE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Növbəti həftə"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {visibleDays.map((d) => {
                const active = d.iso === selectedDayIso;
                const hasAvail = availability ? dayHasAvailability(d.date, availability) : false;
                return (
                  <button
                    type="button"
                    key={d.iso}
                    onClick={() => {
                      setSelectedDayIso(d.iso);
                      setSelectedSlot(null);
                    }}
                    className={`relative py-3 rounded-2xl text-center transition-all border ${
                      active
                        ? "bg-[#4A6741] text-white border-[#4A6741] shadow-md"
                        : hasAvail
                        ? "bg-white text-[#4A4A4A] border-[#E8E4DE] hover:border-[#4A6741]/50"
                        : "bg-[#FAFAF8] text-[#B8B4AE] border-[#F0EDE8]"
                    }`}
                  >
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        active ? "text-white/70" : "text-[#7A7570]"
                      }`}
                    >
                      {d.label || d.weekdayShort}
                    </div>
                    <div className="text-lg font-bold mt-0.5 leading-none">{d.dayNumber}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        active ? "text-white/70" : "text-[#7A7570]"
                      }`}
                    >
                      {d.monthShort}
                    </div>
                    {hasAvail && !active && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-[#4A6741]" />
                    )}
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
              <div className="py-10 flex justify-center">
                <Loader2 className="size-5 animate-spin text-[#4A6741]" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-10">
                <div
                  className="size-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "#F0F5EE" }}
                >
                  <CalendarDays className="size-5 text-[#4A6741]" />
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  Bu gün üçün müəllim mövcud deyil
                </p>
                {nextAvailableDay ? (
                  <button
                    type="button"
                    onClick={() => jumpToDay(nextAvailableDay.iso)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl"
                    style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
                  >
                    Növbəti boş gün: {nextAvailableDay.dayNumber} {nextAvailableDay.monthShort}
                    <ChevronRight className="size-3.5" />
                  </button>
                ) : (
                  <p className="text-[12px] text-[#B8B4AE] mt-1">
                    Növbəti 14 gündə boş vaxt yoxdur
                  </p>
                )}
              </div>
            ) : slots.every((s) => s.disabled) ? (
              <div className="text-center py-10">
                <div
                  className="size-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "#FEF3C7" }}
                >
                  <Info className="size-5 text-amber-700" />
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  Bütün slotlar dolu və ya keçib
                </p>
                {nextAvailableDay ? (
                  <button
                    type="button"
                    onClick={() => jumpToDay(nextAvailableDay.iso)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl"
                    style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
                  >
                    Növbəti boş gün: {nextAvailableDay.dayNumber} {nextAvailableDay.monthShort}
                    <ChevronRight className="size-3.5" />
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
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
                      cls = "bg-[#4A6741] text-white border-[#4A6741] shadow-md";
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
            <p className="text-[11px] text-[#B8B4AE] mt-1 text-right">
              {notes.length} / 500
            </p>
          </div>
        </div>

        {/* ── Right: summary ──────────────────── */}
        <div className="lg:sticky lg:top-24 self-start">
          <div
            className="rounded-3xl overflow-hidden shadow-xl shadow-[#4A6741]/15 border border-[#4A6741]/20 text-white"
            style={{ background: "linear-gradient(145deg,#2a4826,#3d5c35,#4A6741)" }}
          >
            <div className="px-5 pt-5 pb-4 border-b border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="size-3 text-[#A8CCAA]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                  Rezervasiya
                </p>
              </div>
              <p className="text-lg font-bold leading-tight truncate">{teacher.fullName}</p>
            </div>

            <div className="px-5 py-4 space-y-3 text-[13px]">
              <SummaryRow label="Fənn" value={subjectLabel} />
              <SummaryRow label="Tarix" value={dateLabel} />
              <SummaryRow label="Saat" value={timeLabel} />
              <SummaryRow label="Müddət" value={`${duration} dəq`} />
              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/60 text-[12px]">Təxmini qiymət</span>
                <span className="text-xl font-bold tabular-nums">
                  {totalPrice} <span className="text-sm text-white/60">AZN</span>
                </span>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full h-12 rounded-2xl bg-white text-sm font-bold text-[#4A6741] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/95 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <BookOpen className="size-4" />
                )}
                Dərsi rezerv et
              </button>
              {!canSubmit && (
                <p className="text-[11px] text-white/50 text-center mt-2">
                  {!subject
                    ? "Fənn seçin"
                    : !selectedSlot
                    ? "Boş vaxt seçin"
                    : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const empty = value === "—";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/55">{label}</span>
      <span
        className={`font-semibold text-right truncate max-w-[60%] ${
          empty ? "text-white/40" : ""
        }`}
      >
        {value}
      </span>
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
