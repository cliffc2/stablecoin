// src/hooks/useStablecoin.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { stablecoinApi } from '../services/api';
import { TransferRequest, MintRequest, BurnRequest } from '../types/stablecoin';
import { toast } from 'react-hot-toast';

export const useWallet = (address: string) => {
  return useQuery(
    ['wallet', address],
    () => stablecoinApi.getWallet(address),
    {
      enabled: !!address,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );
};

export const useReserve = () => {
  return useQuery('reserve', stablecoinApi.getReserve, {
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useTransactions = (address: string) => {
  return useQuery(
    ['transactions', address],
    () => stablecoinApi.getTransactions(address),
    {
      enabled: !!address,
    }
  );
};

export const useTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (transferRequest: TransferRequest) => stablecoinApi.transfer(transferRequest),
    {
      onSuccess: (data, variables) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries(['wallet', variables.fromAddress]);
        queryClient.invalidateQueries(['wallet', variables.toAddress]);
        queryClient.invalidateQueries(['transactions', variables.fromAddress]);
        toast.success(`Successfully transferred HKD ${variables.amount}`);
      },
      onError: (error: any) => {
        toast.error(`Transfer failed: ${error.response?.data?.message || error.message}`);
      },
    }
  );
};

export const useMint = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (mintRequest: MintRequest) => stablecoinApi.mint(mintRequest),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['wallet', variables.toAddress]);
        queryClient.invalidateQueries('reserve');
        toast.success(`Successfully minted HKD ${variables.amount}`);
      },
      onError: (error: any) => {
        toast.error(`Mint failed: ${error.response?.data?.message || error.message}`);
      },
    }
  );
};

export const useBurn = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (burnRequest: BurnRequest) => stablecoinApi.burn(burnRequest),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['wallet', variables.fromAddress]);
        queryClient.invalidateQueries('reserve');
        toast.success(`Successfully burned HKD ${variables.amount}`);
      },
      onError: (error: any) => {
        toast.error(`Burn failed: ${error.response?.data?.message || error.message}`);
      },
    }
  );
};

export const useComplianceAlerts = () => {
  return useQuery('complianceAlerts', stablecoinApi.getComplianceAlerts, {
    refetchInterval: 30000,
  });
};
