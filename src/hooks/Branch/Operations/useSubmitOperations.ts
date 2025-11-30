import { useMutation } from "@tanstack/react-query"
import axiosInstance from "../../../instance/axiosInstance"


const submitOperations =  async (operationId: string) => {
 const response = await axiosInstance.patch(`/operations/daily/${operationId}/submit`)
    return response.data
}

export const useSubmitOperations = (operationId: string) => useMutation({
    mutationFn: () => submitOperations(operationId),
    onSuccess: () => {},
    onError: () => {}   
})