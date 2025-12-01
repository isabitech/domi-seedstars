import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface UpdateHOFieldsRequest {
  branchId: string;
  field1?: number;
  field2?: number;
  field3?: number;
  frmHO?: number;
  frmBR?: number;
  tbo?: number;
  pcih?: number;
  previousDisbursement?: number;
  previousLoanTotal?: number;
  previousSavingsTotal?: number;
  date: string;
  previousDisbursementRollNo?: number;
  
  
}

export interface UpdateHOFieldsResponse {
  success: boolean;
  data: {
    fields: UpdateHOFieldsRequest;
  };
  message: string;
}

const updateHOFields = async (fieldsData: UpdateHOFieldsRequest): Promise<UpdateHOFieldsResponse> => {
  const { data } = await axiosInstance.patch('/operations/ho-fields', fieldsData);
  return data;
};

export const useUpdateHOFields = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHOFields,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
    onError: (error) => {
      console.error('Update HO fields error:', error);
    }
  });
};
