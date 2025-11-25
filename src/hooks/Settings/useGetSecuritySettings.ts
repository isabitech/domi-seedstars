import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface SecuritySettings {
	passwordMinLength: number;
}

export interface GetSecuritySettingsResponse {
	success: boolean;
	data: {
		settings: SecuritySettings;
	};
	message: string;
}

const getSecuritySettings = async (): Promise<GetSecuritySettingsResponse> => {
	const { data } = await axiosInstance.get('/settings/security');
	return data;
};

export const useGetSecuritySettings = () => {
	return useQuery({
		queryKey: ['settings', 'security'],
		queryFn: getSecuritySettings,
		staleTime: 10 * 60 * 1000,
	});
};
