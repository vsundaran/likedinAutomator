import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: (credentials: any) => authApi.login(credentials),
    });
};

export const useSignupMutation = () => {
    return useMutation({
        mutationFn: (userData: any) => authApi.signup(userData),
    });
};

export const useSendOtpMutation = () => {
    return useMutation({
        mutationFn: ({ email, type }: { email: string; type: 'signup' | 'login' | 'reset_password' }) =>
            authApi.sendOtp(email, type),
    });
};

export const useForgotPasswordMutation = () => {
    return useMutation({
        mutationFn: (email: string) => authApi.forgotPassword(email),
    });
};

export const useResetPasswordMutation = () => {
    return useMutation({
        mutationFn: (data: any) => authApi.resetPassword(data),
    });
};

export const useGetMeQuery = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: () => authApi.getMe(),
    });
};

export const useGetProfileQuery = () => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: () => authApi.getProfile(),
    });
};

export const useUpdateAvatarMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => authApi.updateAvatar(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};
