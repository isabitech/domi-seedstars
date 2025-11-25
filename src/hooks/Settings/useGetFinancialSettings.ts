import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface FinancialSettings {
	taxRate: number;
}

export interface GetFinancialSettingsResponse {
	success: boolean;
	data: {
		settings: FinancialSettings;
	};
	message: string;
}

const getFinancialSettings = async (): Promise<GetFinancialSettingsResponse> => {
	const { data } = await axiosInstance.get('/settings/financial');
	return data;
};

export const useGetFinancialSettings = () => {
	return useQuery({
		queryKey: ['settings', 'financial'],
		queryFn: getFinancialSettings,
		staleTime: 10 * 60 * 1000,
	});
};
