import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance"


const updatePreviousDisbursement = async () => {
    const response = await axiosInstance.patch(`/disbursement-roll/previous`);
    return response.data;
}

export const useUpdatePreviousDisbursement = () => useMutation({
    mutationFn: updatePreviousDisbursement,
    onSuccess: () => {},
    onError: () => {},

})