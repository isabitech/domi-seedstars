import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance";

interface AbiyeReportRequest {
disbursementNo: number;
disbursementAmount: number;
amountToClients: number;
ajoWithdrawalAmount: number;
totalClients: number;
ldSolvedToday: number;
clientsThatPaidToday: number;
ldResolutionMethods: string[];
totalNoOfNewClientTomorrow: number;
totalNoOfOldClientTomorrow: number;
totalPreviousSoOwn: number;
reportDate: string;
totalAmountNeeded: number;
currentLDNo: number;
}

const submitAbiyeReport = async (reportData: AbiyeReportRequest): Promise<any> => {
    const response = await axiosInstance.post('/biye-reports', reportData);
    return response.data;
}

export const useSubmitAbiyeReport = () => useMutation({
    mutationFn: (reportData: AbiyeReportRequest) => submitAbiyeReport(reportData),
    onError: (error) => {}

})