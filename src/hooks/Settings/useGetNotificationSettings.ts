import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface NotificationSettings {
	emailEnabled: boolean;
	smsEnabled: boolean;
}

export interface GetNotificationSettingsResponse {
	success: boolean;
	data: {
		settings: NotificationSettings;
	};
	message: string;
}

const getNotificationSettings = async (): Promise<GetNotificationSettingsResponse> => {
	const { data } = await axiosInstance.get('/settings/notifications');
	return data;
};

export const useGetNotificationSettings = () => {
	return useQuery({
		queryKey: ['settings', 'notifications'],
		queryFn: getNotificationSettings,
		staleTime: 10 * 60 * 1000,
	});
};
