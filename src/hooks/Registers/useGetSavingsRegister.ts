import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface SavingsRegister {
	id: string;
	branchId: string;
	currentSavings: number;
	previousSavingsTotal: number;
	createdAt: string;
	updatedAt: string;
}

export interface GetSavingsRegisterResponse {
	success: boolean;
	data: {
		register: SavingsRegister;
	};
	message: string;
}

const getSavingsRegister = async (branchId: string): Promise<GetSavingsRegisterResponse> => {
	const { data } = await axiosInstance.get('/registers/savings', { params: { branchId } });
	return data;
};

export const useGetSavingsRegister = (branchId: string) => {
	return useQuery({
		queryKey: ['registers', 'savings', branchId],
		queryFn: () => getSavingsRegister(branchId),
		enabled: !!branchId,
		staleTime: 2 * 60 * 1000,
	});
};
