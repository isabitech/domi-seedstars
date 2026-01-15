import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance";

interface GetHOAbiyeReportParams {
    startDate?: string;
    endDate?: string;
}

const getHOAbiyeReport = async (params: GetHOAbiyeReportParams = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) {
        queryParams.append('startDate', params.startDate);
    }
    
    if (params.endDate) {
        queryParams.append('endDate', params.endDate);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/biye-reports/ho?${queryString}` : '/biye-reports/ho';
    
    const response = await axiosInstance.get(url);
    return response.data;
}

export const useGetHOAbiyeReport = (params: GetHOAbiyeReportParams = {}) => useQuery({
    queryKey: ['hoAbiyeReport', params],
    queryFn: () => getHOAbiyeReport(params),
});