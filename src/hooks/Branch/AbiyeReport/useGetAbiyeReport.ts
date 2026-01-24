import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance";


export interface Root {
  success: boolean
  data: Daum[]
  message: string
  timestamp: string
}

export interface Daum {
  _id: string
  branch: string
  disbursementNo: number
  disbursementAmount: number
  amountToClients: number
  ajoWithdrawalAmount: number
  totalClients: number
  ldSolvedToday: number
  clientsThatPaidToday: number
  ldResolutionMethods: string[]
  totalNoOfNewClientTomorrow: number
  totalNoOfOldClientTomorrow: number
  totalPreviousSoOwn: number
  reportDate: string
  totalAmountNeeded: number
  currentLDNo: number
  createdAt: string
  updatedAt: string
  __v: number
}

const getBranchAbiyeReport = async () : Promise<Root> => {
    const response = await axiosInstance.get('/biye-reports');
    return response.data;
}

export const useGetBranchAbiyeReport = () => useQuery({
    queryKey: ['branchAbiyeReport'],
    queryFn: () => getBranchAbiyeReport(),
});