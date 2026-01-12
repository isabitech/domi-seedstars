import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../instance/axiosInstance";
import type { AmountNeedTomorrowBranchResponse, AmountNeedTomorrowData } from './useGetAmountNeedTomorrowBranch';

const getAmountNeedTomorrowByDate = async (date: string): Promise<AmountNeedTomorrowData | null> => {
    try {
        const response = await axiosInstance.get(`/amount-need-tomorrow/date?date=${date}`);
        return response.data.data;
    } catch (error: any) {
        // If no record exists for the date, return null instead of throwing
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

export const useGetAmountNeedTomorrowByDate = (date: string) => {
    return useQuery({
        queryKey: ['amount-need-tomorrow-by-date', date],
        queryFn: () => getAmountNeedTomorrowByDate(date),
        staleTime: 1000 * 60 * 2, // 2 minutes
        enabled: !!date,
    });
};