import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../instance/axiosInstance";
import { CURRENT_DATE } from "../../lib/utils";

const  exportDailyReportExcel = async () =>{
    const response = await axiosInstance.get(`/reports/daily/export?date=${CURRENT_DATE}`, {
        method: 'GET',
    });
    return response.data;
}


export const useExportDailyReportExcel = () => useQuery({
    queryKey: ['reports', 'daily', 'export', 'excel'],
    queryFn: exportDailyReportExcel,
    staleTime: 5 * 60 * 1000, // 5 minutes
})