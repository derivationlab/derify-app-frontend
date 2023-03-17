import { useQuery } from '@tanstack/react-query'

import multicall from '@/utils/multicall'
import { bnPlus, formatUnits } from '@/utils/tools'
import { getDerifyExchangeContract } from '@/utils/contractHelpers'

import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

export const useMarketInfo = (
  exchange?: string,
  pairs?: Record<string, any>
): { data: Record<string, any>; isLoading: boolean } => {
  const { data, isLoading } = useQuery(
    ['useMarketInfo'],
    async () => {
      if (pairs && exchange) {
        const c = getDerifyExchangeContract(exchange)
        const calls = Object.values(pairs).map((address) => ({ name: 'getSideTotalAmount', address }))

        const buybackPool = await c.getSysExchangeBondSizeUpperBound()
        const positionVol = await multicall(DerifyDerivativeAbi, calls)

        let _positionVol = positionVol.reduce((s1: number, [longTotalAmount, shortTotalAmount]: any[]) => {
          const s2 = bnPlus(formatUnits(longTotalAmount, 8), formatUnits(shortTotalAmount, 8))
          return bnPlus(s1, s2)
        }, 0)

        return {
          positionVol: _positionVol,
          buybackPool: formatUnits(String(buybackPool), 8)
        }
      }
      return {
        positionVol: '0',
        buybackPool: '0'
      }
    },
    {
      retry: false,
      initialData: {
        positionVol: '0',
        buybackPool: '0'
      },
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}
