import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import type { LessonResponse, LessonStatus, PageResponse } from "@/types/profile";
import type { UserRole } from "@/types/auth";

function lessonUrl(role: UserRole) {
  return role === "TEACHER"
    ? "/api/v1/teachers/me/lessons"
    : "/api/v1/students/lessons";
}

export function useLessons(role: UserRole, status?: LessonStatus) {
  return useQuery({
    queryKey: ["lessons", role, status],
    queryFn: () => {
      const url = lessonUrl(role);
      const params = status ? `?status=${status}` : "";
      return api
        .get<PageResponse<LessonResponse>>(`${url}${params}`)
        .then((r) => r.data);
    },
    enabled: role === "STUDENT" || role === "TEACHER",
  });
}

export function useConfirmLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) =>
      api.post(`/api/v1/teachers/me/lessons/${lessonId}/confirm`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons"] }),
  });
}

export function useCompleteLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) =>
      api.post(`/api/v1/teachers/me/lessons/${lessonId}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons"] }),
  });
}

export function useCancelLesson(role: UserRole) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, reason }: { lessonId: string; reason: string }) => {
      const base =
        role === "TEACHER"
          ? `/api/v1/teachers/me/lessons/${lessonId}/cancel`
          : `/api/v1/students/lessons/${lessonId}/cancel`;
      return api.post(base, { reason });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons"] }),
  });
}
