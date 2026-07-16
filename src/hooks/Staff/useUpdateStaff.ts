import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Staff } from './useListStaff';

export interface UpdateStaffRequest {
  id: string;
  staffName?: string;
  staffIdNumber?: string;
  employmentDate?: string;
  currentPosition?: string;
  currentBranch?: string;
  residentialAddress?: string;
  guarantorName?: string;
  guarantorNumber?: string;
  gender?: 'male' | 'female';
  branchId?: string;
}

export interface UpdateStaffResponse {
  success: boolean;
  data: {
    staff: Staff;
  };
  message: string;
}

const updateStaff = async ({ id, ...payload }: UpdateStaffRequest): Promise<UpdateStaffResponse> => {
  const { data } = await axiosInstance.put(`/staff/${id}`, payload);
  return data;
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStaff,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', variables.id] });
    },
  });
};
