import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance"

export interface LoanRegister {
  _id: string
  previousLoanTotal: number
  loanDisbursementWithInterest: number
  loanCollection: number
  currentLoanBalance: number
  date: string
  branch: string
  createdAt: string
  updatedAt: string
  __v: number
}

const getLoanRegister = async (
  date: string, 
  branchId: string
): Promise<{ operations: any; loanRegister?: LoanRegister }> => {
  const response = await axiosInstance.get(
    `operations/daily?date=${date}&branchId=${branchId}`
  );
  
  // Return the full response structure to handle both null and valid operations
  if (response.data.data.operations === null) {
    console.log("operations is null for date:", date);
    return { operations: null };
  } else if (response.data.data.operations.loanRegister) {
    console.log("loan register is available");
    return { 
      operations: response.data.data.operations,
      loanRegister: response.data.data.operations.loanRegister 
    };
  } else {
    console.log("operations exists but no loan register");
    return { operations: response.data.data.operations };
  }
};


export const useGetLoanRegister = (date:string, branchId: string) => useQuery({
    queryKey: ['loan-register', date, branchId],
    queryFn: () => getLoanRegister(date, branchId),
    enabled: !!date && !!branchId,
})