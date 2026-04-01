import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Shift } from "@wajeer/db/schema";

import { approveClaim, claimShift, postShift } from "@/functions/shifts";
import { shiftKeys, userKeys } from "@/lib/query-keys";
import type { ShiftFilters } from "@/lib/query-keys";

async function fetchAvailableShifts(filters: ShiftFilters): Promise<Shift[]> {
  const params = new URLSearchParams();
  if (filters.locationId) {
    params.set("locationId", filters.locationId);
  }
  if (filters.role) {
    params.set("role", filters.role);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }

  const response = await fetch(`/api/shifts?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch shifts");
  }
  return response.json();
}

export function useAvailableShifts(filters: ShiftFilters) {
  return useQuery({
    queryKey: shiftKeys.list(filters),
    queryFn: () => fetchAvailableShifts(filters),
    staleTime: 30 * 1000,
  });
}

export function usePostShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.lists() });
    },
  });
}

export function useClaimShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimShift,
    onMutate: async ({ shift_id }) => {
      await queryClient.cancelQueries({
        queryKey: shiftKeys.detail(shift_id),
      });

      const previousShift = queryClient.getQueryData(
        shiftKeys.detail(shift_id)
      );

      queryClient.setQueryData(shiftKeys.detail(shift_id), (old: Shift) => ({
        ...old,
        status: "claimed",
      }));

      return { previousShift };
    },
    onError: (_err, { shift_id }, context) => {
      queryClient.setQueryData(
        shiftKeys.detail(shift_id),
        context?.previousShift
      );
    },
    onSettled: (_data, _error, { shift_id }) => {
      queryClient.invalidateQueries({
        queryKey: shiftKeys.detail(shift_id),
      });
    },
  });
}

export function useApproveClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
