import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface SystemSettings {
	appName: string;
	version: string;
	environment: string;
}

export interface GetSystemSettingsResponse {
	success: boolean;
	data: {
		settings: SystemSettings;
	};
	message: string;
}

const getSystemSettings = async (): Promise<GetSystemSettingsResponse> => {
	const { data } = await axiosInstance.get('/settings/system');
	return data;
};

export const useGetSystemSettings = () => {
	return useQuery({
		queryKey: ['settings', 'system'],
		queryFn: getSystemSettings,
		staleTime: 10 * 60 * 1000,
	});
};
