import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';

import { SubscriptionContext } from '~/src/context/subscription';
import { useAuth } from '~/src/hooks/auth/useAuth';
import { PLAN_ENDPOINT } from '~/src/libs/endpoints/plan';
import { PlanT, SubscriptionContextI } from '~/src/types/subscription';
import http from '~/src/utils/https';

type SubscriptionProviderProps = {
  children: Readonly<React.ReactNode>;
};

export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const { user } = useAuth();

  const { isLoading, data: plan } = useSuspenseQuery({
    queryFn: () => http.get<PlanT>(PLAN_ENDPOINT.GET_PLAN),
    queryKey: ['plan'],
    select: (data) => data?.data || null,
  });

  const { isPending: isVerifyLoading, mutate: onVerifyPayment } = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      http.post(PLAN_ENDPOINT.POST_VERIFY_PAYMENT, {
        paymentId: id,
      }),
  });

  const { isPending: isSubscribeLoading, mutate: onSubScribe } = useMutation({
    mutationFn: ({ slot }: { slot: number }) =>
      http.post(PLAN_ENDPOINT.POST_SUBSCRIBE, {
        slot,
        userId: user?.id,
      }),
  });

  const loading = isLoading || isSubscribeLoading || isVerifyLoading;

  const value: SubscriptionContextI = {
    plan: plan,
    isLoading: loading,
    onSubscribe: onSubScribe,
    onVerify: onVerifyPayment,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};
