import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface UpdateSecuritySettingsRequest {
	passwordMinLength: number;
}

export interface UpdateSecuritySettingsResponse {
	success: boolean;
	data: {
		settings: {
			passwordMinLength: number;
		};
	};
	message: string;
}

const updateSecuritySettings = async (settingsData: UpdateSecuritySettingsRequest): Promise<UpdateSecuritySettingsResponse> => {
	const { data } = await axiosInstance.put('/settings/security', settingsData);
	return data;
};

export const useUpdateSecuritySettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateSecuritySettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['settings', 'security'] });
		},
		onError: (error) => {
			console.error('Update security settings error:', error);
		}
	});
};
