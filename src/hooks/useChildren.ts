import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import type { ChildResponse } from "@/types/profile";

export function useChildren() {
  return useQuery({
    queryKey: ["children"],
    queryFn: () =>
      api.get<ChildResponse[]>("/api/v1/family/my-children").then((r) => r.data),
  });
}
