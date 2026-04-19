import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import type { MyProfileResponse } from "@/types/profile";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () =>
      api.get<MyProfileResponse>("/api/v1/users/me/profile").then((r) => r.data),
  });
}
