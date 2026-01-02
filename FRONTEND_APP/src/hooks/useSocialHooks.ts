import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '../api/social';

export const useGetSocialAccountsQuery = () => {
    return useQuery({
        queryKey: ['socialAccounts'],
        queryFn: () => socialApi.getAccounts(),
    });
};

export const useDisconnectSocialMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (platform: string) => socialApi.disconnectPlatform(platform),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
        },
    });
};
