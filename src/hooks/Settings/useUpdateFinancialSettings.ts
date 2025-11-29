import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface UpdateFinancialSettingsRequest {
	taxRate: number;
}

export interface UpdateFinancialSettingsResponse {
	success: boolean;
	data: {
		settings: {
			taxRate: number;
		};
	};
	message: string;
}

const updateFinancialSettings = async (settingsData: UpdateFinancialSettingsRequest): Promise<UpdateFinancialSettingsResponse> => {
	const { data } = await axiosInstance.put('/settings/financial', settingsData);
	return data;
};

export const useUpdateFinancialSettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateFinancialSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['settings', 'financial'] });
		},
		onError: (error) => {
			console.error('Update financial settings error:', error);
		}
	});
};
