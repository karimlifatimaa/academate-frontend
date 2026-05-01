import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import type { UserResponse } from "@/types/auth";

export interface InviteCodeResponse {
  code: string;
  expiresAt: string;
}

export function useGenerateInviteCode() {
  return useMutation({
    mutationFn: () =>
      api
        .post<InviteCodeResponse>("/api/v1/family/invite-code")
        .then((r) => r.data),
  });
}

export function useMyParents() {
  return useQuery({
    queryKey: ["my-parents"],
    queryFn: () =>
      api.get<UserResponse[]>("/api/v1/family/my-parents").then((r) => r.data),
  });
}

export interface RegisterChildRequest {
  fullName: string;
  grade: number;
  schoolName: string;
  birthDate: string;
}

export function useRegisterChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: RegisterChildRequest) =>
      api.post("/api/v1/auth/register/child", req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["children"] }),
  });
}
