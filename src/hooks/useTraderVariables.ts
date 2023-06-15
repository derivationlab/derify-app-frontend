import { useQuery } from '@tanstack/react-query'

import { ProtocolConfig } from '@/typings'
import { getExchangeContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

let output = Object.create(null)

const innerFunc = async (address: string, trader: string) => {
  const c = getExchangeContract(address)
  const response = await c.getTraderVariables(trader)
  return response
}

export const useTraderVariables = (trader?: string, protocols?: { [key: string]: ProtocolConfig }) => {
  const { data, refetch } = useQuery(
    ['useTraderVariables'],
    async () => {
      if (trader && protocols) {
        const promises = Object.keys(protocols).map(async (p) => [
          await innerFunc(protocols[p].exchange, trader).catch(() => null)
        ])

        const response = await Promise.all(promises)

        if (response.length) {
          response.forEach((data: any, index: number) => {
            if (data[0]) {
              const { totalPositionAmount } = data[0]
              output = {
                ...output,
                [Object.keys(protocols)[index]]: formatUnits(String(totalPositionAmount), 8)
              }
            }
          })
          return output
        }
      }

      return null
    },
    {
      retry: false,
      initialData: null,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}
