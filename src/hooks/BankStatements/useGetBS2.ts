
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

 interface BS2Response {
  success: boolean
  data: BS2Data
  message: string
  timestamp: string
}

 interface BS2Data {
  bankStatement2: BankStatement2
}

export interface BankStatement2 {
  _id: string
  withd: number
  tbo: number
  exAmt: number
  bs2Total: number
  date: string
  branch: string
  user: string
  exPurpose: string
  createdAt: string
  updatedAt: string
  __v: number
}

const getBS2 = async (date:string, branchId:string) : Promise<BS2Response> =>{
    const response = await axiosInstance.get(`/bank-statements/bs2?date=${date}&branchId=${branchId}`);
    return response.data;
}

export const useGetBS2 = (date:string, branchId:string) => useQuery({
    queryKey: ['bank-statement-bs2', date, branchId],
    queryFn: () => getBS2(date, branchId),

})