import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance";

export interface SavingsRegister {
  _id: string;
  previousSavingsTotal: number;
  savings: number;
  savingsWithdrawal: number;
  currentSavings: number;
  date: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const getSavingsRegister = async (
  date: string,
  branchId: string
): Promise<{ operations: any; savingsRegister?: SavingsRegister }> => {
  const response = await axiosInstance.get(
    `operations/daily?date=${date}&branchId=${branchId}`
  );
  
  // Return the full response structure to handle both null and valid operations
  if (response.data.data.operations === null) {
    console.log("operations is null for date:", date);
    return { operations: null };
  } else if (response.data.data.operations.savingsRegister) {
    console.log("savings register is available");
    return { 
      operations: response.data.data.operations,
      savingsRegister: response.data.data.operations.savingsRegister 
    };
  } else {
    console.log("operations exists but no savings register");
    return { operations: response.data.data.operations };
  }
};

export const useGetSavingsRegister = (date: string, branchId: string) =>
  useQuery({
    queryKey: ["savings-register", date, branchId],
    queryFn: () => getSavingsRegister(date, branchId),
    enabled: !!date && !!branchId,
  });
