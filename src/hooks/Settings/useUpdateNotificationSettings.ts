import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface UpdateNotificationSettingsRequest {
	emailEnabled: boolean;
	smsEnabled: boolean;
}

export interface UpdateNotificationSettingsResponse {
	success: boolean;
	data: {
		settings: {
			emailEnabled: boolean;
			smsEnabled: boolean;
		};
	};
	message: string;
}

const updateNotificationSettings = async (settingsData: UpdateNotificationSettingsRequest): Promise<UpdateNotificationSettingsResponse> => {
	const { data } = await axiosInstance.put('/settings/notifications', settingsData);
	return data;
};

export const useUpdateNotificationSettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateNotificationSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['settings', 'notifications'] });
		},
		onError: (error) => {
			console.error('Update notification settings error:', error);
		}
	});
};
