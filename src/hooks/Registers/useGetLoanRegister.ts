import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface LoanRegister {
	id: string;
	branchId: string;
	currentBalance: number;
	previousLoanTotal: number;
	createdAt: string;
	updatedAt: string;
}

export interface GetLoanRegisterResponse {
	success: boolean;
	data: {
		register: LoanRegister;
	};
	message: string;
}

const getLoanRegister = async (branchId: string): Promise<GetLoanRegisterResponse> => {
	const { data } = await axiosInstance.get('/registers/loan', { params: { branchId } });
	return data;
};

export const useGetLoanRegister = (branchId: string) => {
	return useQuery({
		queryKey: ['registers', 'loan', branchId],
		queryFn: () => getLoanRegister(branchId),
		enabled: !!branchId,
		staleTime: 2 * 60 * 1000,
	});
};
