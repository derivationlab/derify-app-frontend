import { useQuery } from '@tanstack/react-query'
import { getCurrentInsuranceDAT } from 'derify-apis-staging'
import { isEmpty } from 'lodash-es'

import { Rec } from '@/typings'

export const useCurrentInsurance = (address: string) => {
  const { data, refetch } = useQuery(
    ['getCurrentInsuranceDAT'],
    async () => {
      const data = await getCurrentInsuranceDAT<{ data: Rec }>(address)
      return data?.data ?? {}
    },
    {
      retry: 0,
      initialData: {},
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (!isEmpty(data)) return { data, refetch }

  return { refetch }
}
