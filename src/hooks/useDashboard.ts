import { chunk, flatten, isEmpty } from 'lodash'
import { Contract } from 'ethers'
import { useSigner } from 'wagmi'
import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import contracts from '@/config/contracts'
import multicall from '@/utils/multicall'
import { estimateGas } from '@/utils/estimateGas'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { bnPlus, formatUnits, inputParameterConversion } from '@/utils/tools'
import tokens, { DEFAULT_MARGIN_TOKEN, MARGIN_TOKENS, PLATFORM_TOKEN } from '@/config/tokens'
import { GrantKeys, MarginToken, MarginTokenKeys, MarginTokenWithQuote, ProtocolConfig, QuoteToken } from '@/typings'
import {
  getDerifyPmrContract,
  getDerifyRankContract,
  getDerifyRewardsContract,
  getDerifyBRewardsContract
} from '@/utils/contractHelpers'
import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

let outputInit = initial()

export const minimumGrantInit: { [key in GrantKeys]: string } = {
  rank: '0',
  mining: '0',
  awards: '0'
}

export const useAddGrant = () => {
  const { data: signer } = useSigner()

  const addGrantPlan = useCallback(
    async (type: string, address: string, amount: string, days1: number, days2: number): Promise<boolean> => {
      if (!signer) return false

      let c: unknown

      if (type === 'rank') {
        c = getDerifyRankContract(address, signer)
      }
      if (type === 'mining') {
        c = getDerifyPmrContract(address, signer)
      }
      if (type === 'awards') {
        c = getDerifyBRewardsContract(address, signer)
      }

      const _amount = inputParameterConversion(amount, 18)

      try {
        const approve = await allowanceApprove(signer, address, tokens.drf.tokenAddress, _amount)

        if (!approve) return false

        const gasLimit = await estimateGas(c as Contract, 'addGrant', [_amount, days1, days2])
        const res = await (c as Contract).addGrant(_amount, days1, days2, { gasLimit })
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  return { addGrantPlan }
}

export const useRankReward = (trader?: string, config?: string) => {
  const output = { drfBalance: '0', drfAccumulatedBalance: '0' }
  const { data, refetch, isLoading } = useQuery(
    ['useRankReward'],
    async () => {
      if (trader && config) {
        const c = getDerifyRewardsContract(config)

        const response = await c.getRankReward(trader)

        const { drfBalance, drfAccumulatedBalance } = response

        return {
          ...output,
          drfBalance: formatUnits(String(drfBalance), 8),
          drfAccumulatedBalance: formatUnits(String(drfAccumulatedBalance), 8)
        }
      }
      return output
    },
    {
      retry: false,
      // initialData: output,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const useBuyBackPool = () => {
  const { data, isLoading } = useQuery(
    ['useBuyBackPool'],
    async () => {
      const calls = MARGIN_TOKENS.map((token) => ({
        name: 'getAllSysExchangeBondSizeUpperBounds',
        params: [[token.tokenAddress]],
        address: contracts.derifyProtocol.contractAddress,
        marginToken: token.symbol
      }))

      const response = await multicall(derifyProtocolAbi, calls)

      if (!isEmpty(response)) {
        response.forEach(([data]: any, index: number) => {
          outputInit = {
            ...outputInit,
            [calls[index].marginToken]: formatUnits(String(data[0]), 8)
          }
        })

        // console.info(output)
        return outputInit
      }

      return outputInit
    },
    {
      retry: false,
      initialData: outputInit,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}

export const useMinimumGrant = (config?: ProtocolConfig) => {
  const { data, refetch, isLoading } = useQuery(
    ['useMinimumGrant'],
    async (): Promise<typeof minimumGrantInit> => {
      if (config?.rank && config?.awards && config?.mining) {
        const { rank, awards, mining } = config
        const c1 = getDerifyPmrContract(mining)
        const c2 = getDerifyRankContract(rank)
        const c3 = getDerifyBRewardsContract(awards)

        const res1 = await c1.minGrantAmount()
        const res2 = await c2.minGrantAmount()
        const res3 = await c3.minGrantAmount()

        return {
          ...minimumGrantInit,
          rank: formatUnits(res2, PLATFORM_TOKEN.precision),
          mining: formatUnits(res1, PLATFORM_TOKEN.precision),
          awards: formatUnits(res3, PLATFORM_TOKEN.precision)
        }
      }
      return minimumGrantInit
    },
    {
      retry: false,
      initialData: minimumGrantInit,
      refetchInterval: 60000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const usePositionInfo = (config?: MarginTokenWithQuote) => {
  const { data, refetch } = useQuery(
    ['usePositionInfo'],
    async () => {
      if (config && config[DEFAULT_MARGIN_TOKEN.symbol as MarginTokenKeys].BTC) {
        const calls = Object.values(config).map((quotes: QuoteToken, j) =>
          Object.values(quotes).map((quote, k) => ({
            name: 'getSideTotalAmount',
            address: quote,
            quoteToken: Object.keys(quotes)[k],
            marginToken: Object.keys(config)[j]
          }))
        )
        const flatterCalls = flatten(calls)

        const response = await multicall(derifyDerivativeAbi, flatterCalls)

        if (response.length > 0) {
          const _chunk = chunk(response, response.length / 2)
          _chunk.forEach((values: any, index: number) => {
            const sum = values.reduce((s1: number, [longTotalAmount, shortTotalAmount]: any[]) => {
              const s2 = bnPlus(formatUnits(longTotalAmount, 8), formatUnits(shortTotalAmount, 8))
              return bnPlus(s1, s2)
            }, 0)
            outputInit = {
              ...outputInit,
              [Object.keys(config)[index]]: sum
            }
          })

          // console.info(output)

          return outputInit
        }

        return outputInit
      }

      return outputInit
    },
    {
      retry: false,
      initialData: outputInit,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}

function initial(): MarginToken {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0'
    }
  })

  return value
}
