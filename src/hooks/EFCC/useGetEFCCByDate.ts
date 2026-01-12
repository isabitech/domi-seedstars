import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../instance/axiosInstance";
import type { EFCCBranchResponse, Data } from './useGetEFCCBranch';

const getEFCCByDate = async (date: string): Promise<Data | null> => {
    try {
        const response = await axiosInstance.get(`/efcc/date?date=${date}`);
        return response.data.data;
    } catch (error: any) {
        // If no record exists for the date, return null instead of throwing
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

export const useGetEFCCByDate = (date: string) => {
    return useQuery({
        queryKey: ['efcc-by-date', date],
        queryFn: () => getEFCCByDate(date),
        staleTime: 1000 * 60 * 2, // 2 minutes
        enabled: !!date,
    });
};