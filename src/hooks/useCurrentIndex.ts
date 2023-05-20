import { useQuery } from '@tanstack/react-query'

import { getCurrentIndexDAT } from '@/api'
import { marginTokenList } from '@/store'

export const useCurrentIndex = (list: (typeof marginTokenList)[]) => {
  let output = Object.create(null)

  const { data } = useQuery(
    ['useCurrentIndex'],
    async () => {
      if (list.length) {
        const promises = list.map(
          async (token) => await getCurrentIndexDAT(token.margin_token).then(({ data }) => data)
        )

        const response = await Promise.all(promises)

        if (response.length > 0) {
          response.forEach((margin, index) => {
            output = {
              ...output,
              [list[index].symbol]: margin
            }
          })

          return output
        }
      }

      return null
    },
    {
      retry: 0,
      initialData: null,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
