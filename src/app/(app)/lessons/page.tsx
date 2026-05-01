"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { az } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import {
  useLessons,
  useConfirmLesson,
  useCompleteLesson,
  useCancelLesson,
} from "@/hooks/useLessons";
import type { LessonResponse, LessonStatus } from "@/types/profile";
import type { UserRole } from "@/types/auth";
import { ReviewModal } from "@/components/lessons/ReviewModal";

/* ── Subject labels ──────────────────────────────── */
const SUBJECT_LABELS: Record<string, string> = {
  AZERBAYCAN_DILI: "Azərbaycan dili",
  EDEBIYYAT: "Ədəbiyyat",
  RIYAZIYYAT: "Riyaziyyat",
  FIZIKA: "Fizika",
  KIMYA: "Kimya",
  BIOLOGIYA: "Biologiya",
  TARIX: "Tarix",
  COGRAFIYA: "Coğrafiya",
  INGILIS_DILI: "İngilis dili",
  INFORMATIKA: "İnformatika",
  MATH: "Riyaziyyat",
  PHYSICS: "Fizika",
};

/* ── Status badge ────────────────────────────────── */
const STATUS_CONFIG: Record<
  LessonStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Gözlənilir",
    className: "bg-amber-100 text-amber-700",
  },
  CONFIRMED: {
    label: "Təsdiqləndi",
    className: "bg-emerald-100 text-emerald-700",
  },
  CANCELLED: {
    label: "Ləğv edildi",
    className: "bg-red-100 text-red-600",
  },
  COMPLETED: {
    label: "Tamamlandı",
    className: "bg-gray-100 text-gray-600",
  },
};

function StatusBadge({ status }: { status: LessonStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

/* ── Initials avatar ─────────────────────────────── */
function Avatar({ name, url }: { name?: string | null; url?: string | null }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name ?? ""}
        className="h-10 w-10 rounded-full object-cover shrink-0"
      />
    );
  }
  const safeName = name?.trim() || "?";
  const parts = safeName.split(" ");
  const initials =
    parts.length >= 2
      ? (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
      : safeName.slice(0, 2);
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white uppercase shrink-0"
      style={{ background: "#4A6741" }}
    >
      {initials}
    </span>
  );
}

/* ── Lesson card ─────────────────────────────────── */
function LessonCard({
  lesson,
  role,
  onConfirm,
  onComplete,
  onCancel,
  onReview,
}: {
  lesson: LessonResponse;
  role: UserRole;
  onConfirm?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onReview?: (lesson: LessonResponse) => void;
}) {
  const isTeacher = role === "TEACHER";
  const personName = isTeacher ? lesson.studentName : lesson.teacherName;
  const personAvatar = isTeacher ? null : lesson.teacherAvatarUrl;
  const personLabel = isTeacher ? "Şagird" : "Müəllim";

  const date = parseISO(lesson.scheduledAt);
  const dateStr = format(date, "d MMMM yyyy", { locale: az });
  const timeStr = format(date, "HH:mm");

  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 p-5 space-y-4 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={personName} url={personAvatar} />
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">{personName}</p>
            <p className="text-xs text-muted-foreground">{personLabel}</p>
          </div>
        </div>
        <StatusBadge status={lesson.status} />
      </div>

      {/* Info row */}
      <div className="grid grid-cols-3 gap-3 rounded-xl bg-[#F8F5F0] px-4 py-3">
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Fənn
          </p>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {SUBJECT_LABELS[lesson.subject] ?? lesson.subject}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Tarix
          </p>
          <p className="text-sm font-medium text-[#1A1A1A]">{dateStr}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Saat
          </p>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {timeStr} · {lesson.durationMinutes} dəq
          </p>
        </div>
      </div>

      {/* Notes */}
      {lesson.notes && (
        <p className="text-sm text-muted-foreground italic">"{lesson.notes}"</p>
      )}

      {/* Cancellation reason */}
      {lesson.status === "CANCELLED" && lesson.cancellationReason && (
        <p className="text-sm text-red-500">
          Səbəb: {lesson.cancellationReason}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {lesson.status === "CONFIRMED" && lesson.meetingLink && (
          <a
            href={lesson.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)",
            }}
          >
            <Video className="size-3.5" />
            Dərsə qoşul
          </a>
        )}

        {isTeacher && lesson.status === "PENDING" && (
          <button
            onClick={() => onConfirm?.(lesson.id)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)",
            }}
          >
            <CheckCircle className="size-3.5" />
            Təsdiqlə
          </button>
        )}

        {isTeacher && lesson.status === "CONFIRMED" && (
          <button
            onClick={() => onComplete?.(lesson.id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#4A6741] px-4 py-2 text-sm font-semibold text-[#4A6741] hover:bg-[#F0F5EE] transition-colors"
          >
            <CheckCircle className="size-3.5" />
            Tamamla
          </button>
        )}

        {lesson.status === "COMPLETED" && !isTeacher && (
          <button
            onClick={() => onReview?.(lesson)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2DDD5] px-4 py-2 text-sm font-medium text-[#4A4A4A] hover:bg-muted/50 transition-colors"
          >
            <Star className="size-3.5" />
            Rəy yaz
          </button>
        )}

        {(lesson.status === "PENDING" || lesson.status === "CONFIRMED") && (
          <button
            onClick={() => onCancel?.(lesson.id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2DDD5] px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <XCircle className="size-3.5" />
            Ləğv et
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────── */
function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <CalendarDays className="size-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/* ── Tab filter ──────────────────────────────────── */
const TABS: { value: LessonStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Hamısı" },
  { value: "PENDING", label: "Gözlənilir" },
  { value: "CONFIRMED", label: "Təsdiqlənib" },
  { value: "COMPLETED", label: "Tamamlanıb" },
  { value: "CANCELLED", label: "Ləğv edilib" },
];

/* ── Main page ───────────────────────────────────── */
export default function LessonsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useProfile();
  const role: UserRole = profile?.role ?? user?.role ?? "STUDENT";

  const [tab, setTab] = useState<LessonStatus | "ALL">("ALL");
  const status = tab === "ALL" ? undefined : tab;
  const [reviewLesson, setReviewLesson] = useState<LessonResponse | null>(null);

  const { data, isLoading } = useLessons(role, status);
  const confirm = useConfirmLesson();
  const complete = useCompleteLesson();
  const cancel = useCancelLesson(role);

  const handleConfirm = async (id: string) => {
    try {
      await confirm.mutateAsync(id);
      toast.success("Dərs təsdiqləndi");
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await complete.mutateAsync(id);
      toast.success("Dərs tamamlandı");
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const handleCancel = async (id: string) => {
    const reason = window.prompt("Ləğvetmə səbəbini yazın:");
    if (!reason) return;
    try {
      await cancel.mutateAsync({ lessonId: id, reason });
      toast.success("Dərs ləğv edildi");
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  const lessons = data?.content ?? [];
  const isTeacher = role === "TEACHER";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Dərslər</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isTeacher
              ? "Şagirdlərin rezerv etdiyi dərslər"
              : "Rezerv etdiyiniz dərslər"}
          </p>
        </div>
        {data && (
          <span className="text-sm text-muted-foreground">
            {data.totalElements} dərs
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as LessonStatus[]).map(
          (s) => (
            <div
              key={s}
              className="rounded-2xl bg-white ring-1 ring-black/5 px-4 py-3"
            >
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {STATUS_CONFIG[s].label}
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A]">
                {isLoading ? (
                  <span className="text-muted-foreground/40">—</span>
                ) : (
                  (data?.content ?? []).filter((l) => l.status === s).length
                )}
              </p>
            </div>
          )
        )}
      </div>

      {/* Tab filter */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            style={
              tab === value
                ? { background: "#4A6741", color: "white" }
                : {
                    background: "white",
                    color: "#4A4A4A",
                    border: "1px solid #E2DDD5",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-[#4A6741]" />
        </div>
      ) : lessons.length === 0 ? (
        <Empty label="Bu kateqoriyada dərs tapılmadı" />
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              role={role}
              onConfirm={handleConfirm}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onReview={setReviewLesson}
            />
          ))}
        </div>
      )}

      {reviewLesson && (
        <ReviewModal
          teacherId={reviewLesson.teacherId}
          teacherName={reviewLesson.teacherName}
          onClose={() => setReviewLesson(null)}
        />
      )}
    </div>
  );
}
