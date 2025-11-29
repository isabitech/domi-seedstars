import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

 interface BS1Response {
  success: boolean
  data: BS1Data
  message: string
  timestamp: string
}

 interface BS1Data {
  bankStatement1: BankStatement1
}

export interface BankStatement1 {
  _id: string
  opening: number
  recHO: number
  recBO: number
  domi: number
  pa: number
  bs1Total: number
  date: string
  branch: string
  createdAt: string
  updatedAt: string
  __v: number
}


const getBS1 = async (date:string, branchId:string) : Promise<BS1Response> =>{
    const response = await axiosInstance.get(`/bank-statements/bs1?date=${date}&branchId=${branchId}`);
    return response.data;
}

export const useGetBS1 = (date:string, branchId:string) => useQuery({
    queryKey: ['bank-statement-bs1', date, branchId],
    queryFn: () => getBS1(date, branchId),
    enabled: !!date && !!branchId,

})