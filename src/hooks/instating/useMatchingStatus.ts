import { useQuery } from '@tanstack/react-query';
import { matchingApi } from '@/apis';

export const useMatchingStatus = () =>
  useQuery({
    queryKey: ['matchings', 'status'],
    queryFn: matchingApi.getMatchingStatus,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
