import { useQuery } from '@tanstack/react-query'
import { getCurrentIndexDAT } from 'derify-apis-v20'

import { marginTokenList } from '@/store'
import { Rec } from '@/typings'

export const useAllCurrentIndex = (list: (typeof marginTokenList)[]) => {
  let output = Object.create(null)
  const enabled = list.length > 0
  const { data } = useQuery(
    ['useAllCurrentIndex'],
    async () => {
      if (list.length) {
        const promises = list.map(
          async (token) => await getCurrentIndexDAT<{ data: Rec }>(token.margin_token).then(({ data }) => data)
        )
        const response = await Promise.allSettled(promises)
        response.forEach((res, index) => {
          if (res.status === 'fulfilled') {
            output = {
              ...output,
              [list[index].symbol]: res.value
            }
          }
        })
        return output
      }
      return output
    },
    {
      retry: 0,
      enabled,
      initialData: output,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
