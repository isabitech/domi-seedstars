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
  previousDisbursementRollNo: number
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

const MAX_BRANCH_LIMIT = 100;

const sanitizeBranchParams = (params: ListBranchesParams = {}): ListBranchesParams => {
  const safePage = params.page && params.page > 0 ? params.page : 1;
  const requestedLimit = params.limit ?? 10;
  const safeLimit = Math.min(Math.max(requestedLimit, 1), MAX_BRANCH_LIMIT);

  return {
    ...params,
    page: safePage,
    limit: safeLimit,
  };
};

const getBranches = async (params: ListBranchesParams = {}): Promise<ListBranchesResponse> => {
  const safeParams = sanitizeBranchParams(params);
  const { data } = await axiosInstance.get('/branches', { params: safeParams });
  return data;
};

export const useListBranches = (params: ListBranchesParams = {}) => {
  const safeParams = sanitizeBranchParams(params);

  return useQuery({
    queryKey: ['branches', 'list', safeParams],
    queryFn: () => getBranches(safeParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
