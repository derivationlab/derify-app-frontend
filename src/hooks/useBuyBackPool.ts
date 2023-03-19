import { isEmpty } from 'lodash'
import { useQuery } from '@tanstack/react-query'

import multicall from '@/utils/multicall'
import contracts from '@/config/contracts'
import { formatUnits } from '@/utils/tools'
import { MarginToken } from '@/typings'
import { MARGIN_TOKENS } from '@/config/tokens'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

const initial = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0'
    }
  })

  return value
}

export const useBuyBackPool = () => {
  let output = initial()
  const { data, isLoading } = useQuery(
    ['useBuyBackPool'],
    async () => {
      const calls = MARGIN_TOKENS.map((token) => ({
        name: 'getAllSysExchangeBondSizeUpperBounds',
        params: [[token.tokenAddress]],
        address: contracts.derifyProtocol.contractAddress,
        marginToken: token.symbol
      }))

      const response = await multicall(DerifyProtocolAbi, calls)

      if (!isEmpty(response)) {
        response.forEach(([data]: any, index: number) => {
          output = {
            ...output,
            [calls[index].marginToken]: formatUnits(String(data[0]), 8)
          }
        })

        // console.info(output)
        return output
      }

      return output
    },
    {
      retry: false,
      initialData: output,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}
