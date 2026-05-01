"use client";

import { useState } from "react";
import { Star, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateReview } from "@/hooks/useBooking";

interface Props {
  teacherId: string;
  teacherName: string;
  onClose: () => void;
}

export function ReviewModal({ teacherId, teacherName, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const { mutateAsync, isPending } = useCreateReview(teacherId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Ən azı 1 ulduz seçin");
      return;
    }
    try {
      await mutateAsync({ rating, comment: comment.trim() || undefined });
      toast.success("Rəy göndərildi. Təşəkkürlər!");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Rəy göndərilə bilmədi");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 sm:p-8 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#7A7570] hover:bg-[#F5F2EE] transition-colors"
          aria-label="Bağla"
        >
          <X className="size-4" />
        </button>

        <div>
          <h2
            className="text-xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Rəy yazın
          </h2>
          <p className="text-sm text-[#7A7570] mt-1">{teacherName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Qiymətləndirmə
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`size-8 ${
                      i <= (hover || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-100 text-gray-200"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-[#4A4A4A]">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Şərh (məcburi deyil)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Müəllim haqqında fikrinizi paylaşın..."
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8E4DE] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#4A6741] resize-none"
            />
            <p className="text-[11px] text-[#B8B4AE] mt-1">{comment.length} / 500</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-[#E8E4DE] text-sm font-semibold text-[#4A4A4A] hover:bg-[#F5F2EE] transition-colors"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 rounded-xl text-sm font-bold text-white shadow-lg disabled:opacity-60 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#4A6741,#6B8F6E)" }}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Göndər
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
