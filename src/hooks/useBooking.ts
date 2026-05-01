import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import type { LessonResponse } from "@/types/profile";

export interface BookLessonRequest {
  teacherId: string;
  subject: string;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
}

export function useBookLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: BookLessonRequest) =>
      api
        .post<LessonResponse>("/api/v1/students/lessons", req)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons"] }),
  });
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

export function useCreateReview(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateReviewRequest) =>
      api.post(`/api/v1/students/teachers/${teacherId}/reviews`, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher-reviews", teacherId] });
      qc.invalidateQueries({ queryKey: ["teacher-profile", teacherId] });
    },
  });
}
