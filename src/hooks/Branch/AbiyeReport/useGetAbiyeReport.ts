import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance";



const getBranchAbiyeReport = async () => {
    const response = await axiosInstance.get('/biye-reports');
    return response.data;
}

export const useGetBranchAbiyeReport = () => useQuery({
    queryKey: ['branchAbiyeReport'],
    queryFn: () => getBranchAbiyeReport(),
});