import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Staff } from './useListStaff';

export interface CreateStaffRequest {
  staffName: string;
  staffIdNumber: string;
  employmentDate: string;
  currentPosition: string;
  currentBranch: string;
  residentialAddress: string;
  guarantorName: string;
  guarantorNumber: string;
  gender: 'male' | 'female';
  branchId: string;
}

export interface CreateStaffResponse {
  success: boolean;
  data: {
    staff: Staff;
  };
  message: string;
}

const createStaff = async (payload: CreateStaffRequest): Promise<CreateStaffResponse> => {
  const { data } = await axiosInstance.post('/staff', payload);
  return data;
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};
