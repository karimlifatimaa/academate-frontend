import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import type { UserResponse } from "@/types/auth";
import type { PageResponse } from "@/types/profile";

export interface AdminTeacherSummary {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  subjects?: string[];
  rating?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  verifiedTeachers: number;
  pendingTeachers: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<AdminStats>("/api/v1/admin/stats").then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useAdminUsers(role: string | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: ["admin-users", role, page, size],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (role) params.set("role", role);
      return api
        .get<PageResponse<UserResponse>>(`/api/v1/admin/users?${params}`)
        .then((r) => r.data);
    },
  });
}

export function useAdminTeachers(page = 0, size = 20) {
  return useQuery({
    queryKey: ["admin-teachers", page, size],
    queryFn: () =>
      api
        .get<PageResponse<AdminTeacherSummary>>(
          `/api/v1/admin/teachers?page=${page}&size=${size}`
        )
        .then((r) => r.data),
  });
}

export function useVerifyTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: string) =>
      api.patch(`/api/v1/admin/teachers/${teacherId}/verify`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-teachers"] }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.patch(`/api/v1/admin/users/${userId}/deactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-teachers"] });
    },
  });
}
