import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import type {
  TeacherSearchResponse,
  TeacherPublicProfile,
  AvailabilitySlot,
  ReviewResponse,
  PageResponse,
} from "@/types/profile";

export function useTeachers(subject?: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ["teachers", subject, page, size],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (subject) params.set("subject", subject);
      return api
        .get<PageResponse<TeacherSearchResponse>>(`/api/v1/teachers?${params}`)
        .then((r) => r.data);
    },
  });
}

export function useTeacherProfile(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-profile", teacherId],
    queryFn: () =>
      api
        .get<TeacherPublicProfile>(`/api/v1/users/teachers/${teacherId}`)
        .then((r) => r.data),
    enabled: !!teacherId,
  });
}

export function useTeacherAvailability(teacherId: string) {
  return useQuery({
    queryKey: ["teacher-availability", teacherId],
    queryFn: () =>
      api
        .get<AvailabilitySlot[]>(`/api/v1/teachers/${teacherId}/availability`)
        .then((r) => r.data),
    enabled: !!teacherId,
  });
}

export function useTeacherReviews(teacherId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ["teacher-reviews", teacherId, page],
    queryFn: () =>
      api
        .get<PageResponse<ReviewResponse>>(
          `/api/v1/teachers/${teacherId}/reviews?page=${page}&size=${size}`
        )
        .then((r) => r.data),
    enabled: !!teacherId,
  });
}
