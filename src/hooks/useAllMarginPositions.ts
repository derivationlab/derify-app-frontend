import { useQuery } from '@tanstack/react-query'

import { getAllMarginPositions } from '@/api'
import { Rec } from '@/typings'

const output = Object.create(null)
export const useAllMarginPositions = () => {
  const { data, refetch } = useQuery(
    ['useAllMarginPositions'],
    async () => {
      const { data } = await getAllMarginPositions()

      if (data) {
        data.forEach((d: Rec) => {
          output[d.margin_token] = {
            ...output[d.margin_token],
            [d.token]: d.total_size
          }
        })
        console.info(output)
        return output
      }
      return null
    },
    {
      retry: 0,
      initialData: null,
      refetchInterval: 600000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}
