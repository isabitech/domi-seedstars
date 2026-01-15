import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { SenatePlanningBranchResponse } from './useGetSenatePlanningBranch';

const getSenatePlanningByDate = async (date: string): Promise<SenatePlanningBranchResponse> => {
  const { data } = await axiosInstance.get(`/senate-planning/branch/${date}`);
  return data;
};

export const useGetSenatePlanningByDate = (date: string) => {
  return useQuery({
    queryKey: ['senate-planning', 'branch', date],
    queryFn: () => getSenatePlanningByDate(date),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!date,
  });
};