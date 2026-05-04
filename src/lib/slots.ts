import type {
  AvailabilitySlot,
  BookedTimeRange,
  LessonResponse,
} from "@/types/profile";

const JS_DAY_TO_NAME = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export interface DayOption {
  date: Date;
  iso: string;
  label: string;
  weekdayShort: string;
  dayNumber: number;
  monthShort: string;
}

const WEEKDAY_SHORT_AZ = ["B", "B.E", "Ç.A", "Ç", "C.A", "C", "Ş"];
const MONTH_SHORT_AZ = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "İyn",
  "İyl",
  "Avq",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];

export function buildDayStrip(daysAhead = 14, startDate?: Date): DayOption[] {
  const today = startDate ?? new Date();
  today.setHours(0, 0, 0, 0);
  const out: DayOption[] = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({
      date: d,
      iso,
      label: i === 0 ? "Bu gün" : i === 1 ? "Sabah" : "",
      weekdayShort: WEEKDAY_SHORT_AZ[d.getDay()],
      dayNumber: d.getDate(),
      monthShort: MONTH_SHORT_AZ[d.getMonth()],
    });
  }
  return out;
}

export interface TimeSlot {
  /** ISO datetime — exact start moment */
  iso: string;
  /** "HH:mm" — display label */
  hhmm: string;
  /** Disabled because already past, booked by current student, or booked by another student */
  disabled: boolean;
  /** Reason for disabled (for tooltips / a11y) */
  reason?: "PAST" | "MY_BOOKING" | "BOOKED";
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function minutesToHHMM(total: number) {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/**
 * Generate 60-minute slot starts for a given date based on the teacher's
 * weekly availability template, then mark slots that are in the past or that
 * conflict with the student's own existing bookings.
 */
export function generateSlotsForDate(
  date: Date,
  availability: AvailabilitySlot[],
  myLessons: LessonResponse[],
  bookedTimes: BookedTimeRange[] = [],
  durationMinutes = 60,
  stepMinutes = 60
): TimeSlot[] {
  const dayName = JS_DAY_TO_NAME[date.getDay()];
  const windows = availability.filter((a) => a.dayOfWeek === dayName);
  if (windows.length === 0) return [];

  const now = new Date();
  const yyyy = date.getFullYear();
  const mm = date.getMonth();
  const dd = date.getDate();

  const myBookedRanges = myLessons
    .filter((l) => l.status === "PENDING" || l.status === "CONFIRMED")
    .map((l) => {
      const start = new Date(l.scheduledAt).getTime();
      return { start, end: start + l.durationMinutes * 60_000 };
    });

  const allBookedRanges = bookedTimes.map((r) => ({
    start: new Date(r.startTime).getTime(),
    end: new Date(r.endTime).getTime(),
  }));

  const slots: TimeSlot[] = [];

  for (const w of windows) {
    const startM = toMinutes(w.startTime.slice(0, 5));
    const endM = toMinutes(w.endTime.slice(0, 5));
    for (let m = startM; m + durationMinutes <= endM; m += stepMinutes) {
      const slotStart = new Date(yyyy, mm, dd, Math.floor(m / 60), m % 60, 0, 0);
      const slotStartT = slotStart.getTime();
      const slotEnd = slotStartT + durationMinutes * 60_000;

      let disabled = false;
      let reason: TimeSlot["reason"] | undefined;

      if (slotStartT <= now.getTime()) {
        disabled = true;
        reason = "PAST";
      } else if (
        myBookedRanges.some((r) => slotStartT < r.end && slotEnd > r.start)
      ) {
        disabled = true;
        reason = "MY_BOOKING";
      } else if (
        allBookedRanges.some((r) => slotStartT < r.end && slotEnd > r.start)
      ) {
        disabled = true;
        reason = "BOOKED";
      }

      slots.push({
        // Local-naive ISO string (no timezone). Backend stores LocalDateTime,
        // so we must send the wall-clock time the user picked, not its UTC
        // equivalent — otherwise a 09:00 Baku slot becomes 05:00 on the
        // backend and falls outside the teacher's availability window.
        iso: localIso(slotStart),
        hhmm: minutesToHHMM(m),
        disabled,
        reason,
      });
    }
  }

  return slots;
}

function localIso(d: Date): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  );
}
