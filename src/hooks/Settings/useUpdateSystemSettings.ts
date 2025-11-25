import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface UpdateSystemSettingsRequest {
	appName: string;
}

export interface UpdateSystemSettingsResponse {
	success: boolean;
	data: {
		settings: {
			appName: string;
			version: string;
			environment: string;
		};
	};
	message: string;
}

const updateSystemSettings = async (settingsData: UpdateSystemSettingsRequest): Promise<UpdateSystemSettingsResponse> => {
	const { data } = await axiosInstance.put('/settings/system', settingsData);
	return data;
};

export const useUpdateSystemSettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateSystemSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['settings', 'system'] });
		},
		onError: (error) => {
			console.error('Update system settings error:', error);
		}
	});
};
