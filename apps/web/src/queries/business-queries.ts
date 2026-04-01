import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBusiness,
  getBusiness,
  getMyBusinesses,
} from "@/functions/business";
import { createLocation, getBusinessLocations } from "@/functions/location";
import { businessKeys } from "@/lib/query-keys";

export function useMyBusinesses() {
  return useQuery({
    queryKey: businessKeys.all,
    queryFn: () => getMyBusinesses(),
    staleTime: 60 * 1000,
  });
}

export function useBusiness(businessId: string) {
  return useQuery({
    queryKey: businessKeys.detail(businessId),
    queryFn: () => getBusiness({ data: { business_id: businessId } }),
    enabled: !!businessId,
  });
}

export function useBusinessLocations(businessId: string) {
  return useQuery({
    queryKey: businessKeys.locations(businessId),
    queryFn: () => getBusinessLocations({ data: { business_id: businessId } }),
    enabled: !!businessId,
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLocation,
    onSuccess: (_, variables) => {
      const businessId = variables.data?.business_id;
      if (businessId) {
        queryClient.invalidateQueries({
          queryKey: businessKeys.locations(businessId),
        });
      }
    },
  });
}
