import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance"


interface BankStatement2Request {
    tbo: number;
    exAmt: number;
    exPurpose: string;
}

const createBankStatement1 = async (opening: number) => {
    const response = await axiosInstance.post('/operations/daily',{opening});
    return response.data;
}

const createBankStatement2 = async (bankStatement2Payload: BankStatement2Request) => {
    const response = await axiosInstance.post('/operations/daily/', bankStatement2Payload);
    return response.data;
}

export const useCreateBankStatement = () => useMutation({
    mutationFn: (data: {step: number, payload: any}) => {
        if(data.step === 1){
            return createBankStatement1(data.payload.openingBal);
        } else {
            return createBankStatement2(data.payload);
        }
    },
    onError: (error) => {
        console.error('Create bank statement error:', error);
    },
    onSuccess: () => {
        // Invalidate or refetch queries if needed
    }
})