import { useQuery } from '@tanstack/react-query'
import { isEmpty } from 'lodash'

import { getCurrentInsuranceDAT } from '@/api'

export const useCurrentInsurance = (address: string) => {
  const { data, refetch } = useQuery(
    ['getCurrentInsuranceDAT'],
    async () => {
      const data = await getCurrentInsuranceDAT(address)
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
