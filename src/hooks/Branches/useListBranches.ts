import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

// export interface Branch {
//   id: string;
//   name: string;
//   code: string;
//   address: string;
//   phone: string;
//   email: string;
//   status: 'active' | 'inactive';
//   createdAt: string;
//   updatedAt: string;
// }

// export interface ListBranchesResponse {
//   success: boolean;
//   data: {
//     branches: Branch[];
//     count: number;
//     total: number;
//     pagination?: {
//       page: number;
//       limit: number;
//       pages: number;
//       total: number;
//       hasNext: boolean;
//       hasPrev: boolean;
//     };
//   };
//   message: string;
// }

export interface ListBranchesResponse {
  success: boolean
  data: ListBranchesResponseData
  message: string
  timestamp: string
}

export interface ListBranchesResponseData {
  count: number
  total: number
  pagination: Pagination
  branches: Branch[]
}

export interface Pagination {
  page: number
  limit: number
  pages: number
  total: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Branch {
  _id: string
  name: string
  code: string
  phone: string
  address: string
  email: string
  dailyLimit: number
  status: string
  previousLoanTotal: number
  previousSavingsTotal: number
  previousDisbursement: number
  loanMultiplier: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  __v: number
  managerName?: string
  managerUsername?: string
  managerEmail?: string
  managerId?: string
  managerPassword?: string
  operationHours?: string
}


export interface ListBranchesParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  search?: string;
}

const getBranches = async (params: ListBranchesParams = {}): Promise<ListBranchesResponse> => {
  const { data } = await axiosInstance.get('/branches', { params });
  return data;
};

export const useListBranches = (params: ListBranchesParams = {}) => {
  return useQuery({
    queryKey: ['branches', 'list', params],
    queryFn: () => getBranches(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
