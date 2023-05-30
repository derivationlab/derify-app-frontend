import { useQuery } from '@tanstack/react-query'

import { getAllMarginPositions } from '@/api'
import { Rec } from '@/typings'

let output = Object.create(null)
export const useAllMarginPositions = () => {
  const { data, refetch } = useQuery(
    ['useAllMarginPositions'],
    async () => {
      const { data } = await getAllMarginPositions()

      if (data) {
        data.forEach((d: Rec) => {
          output = {
            ...output,
            [d.margin_token]: d.total_size
          }
        })
        return output
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

  return { data, refetch }
}
