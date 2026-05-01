import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import type { AvailabilitySlot } from "@/types/profile";

export interface AvailabilitySlotRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export function useMyAvailability(teacherId: string | undefined) {
  return useQuery({
    queryKey: ["my-availability", teacherId],
    queryFn: () =>
      api
        .get<AvailabilitySlot[]>(`/api/v1/teachers/${teacherId}/availability`)
        .then((r) => r.data),
    enabled: !!teacherId,
  });
}

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slots: AvailabilitySlotRequest[]) =>
      api.put("/api/v1/teachers/me/availability", slots),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-availability"] });
      qc.invalidateQueries({ queryKey: ["teacher-availability"] });
    },
  });
}
