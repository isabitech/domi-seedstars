import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface Staff {
  _id: string;
  staffName: string;
  staffIdNumber: string;
  employmentDate: string;
  currentPosition: string;
  currentBranch: string;
  residentialAddress: string;
  guarantorName: string;
  guarantorNumber: string;
  gender: 'male' | 'female';
  branch?: {
    _id: string;
    name: string;
    code: string;
  };
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListStaffParams {
  page?: number;
  limit?: number;
  branchId?: string;
  search?: string;
  gender?: 'male' | 'female';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListStaffResponse {
  success: boolean;
  data: {
    staff: Staff[];
    count: number;
    total: number;
    pagination?: {
      page: number;
      limit: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
}

const listStaff = async (params: ListStaffParams = {}): Promise<ListStaffResponse> => {
  const { data } = await axiosInstance.get('/staff', { params });
  return data;
};

export const useListStaff = (params: ListStaffParams = {}) => {
  return useQuery({
    queryKey: ['staff', 'list', params],
    queryFn: () => listStaff(params),
    staleTime: 2 * 60 * 1000,
  });
};
