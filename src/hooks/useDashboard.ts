import { chunk, flatten, isEmpty } from 'lodash'
import { Contract } from 'ethers'
import { useSigner } from 'wagmi'
import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import contracts from '@/config/contracts'
import multicall from '@/utils/multicall'
import { MarginToken } from '@/typings'
import { estimateGas } from '@/utils/estimateGas'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { bnPlus, formatUnits, inputParameterConversion } from '@/utils/tools'
import tokens, { DEFAULT_MARGIN_TOKEN, MARGIN_TOKENS, PLATFORM_TOKEN } from '@/config/tokens'
import {
  getDerifyPmrContract,
  getDerifyRankContract,
  getDerifyRewardsContract,
  getDerifyBRewardsContract
} from '@/utils/contractHelpers'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

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

export const useRankReward = (trader?: string, rewards?: string) => {
  const output = { drfBalance: '0', drfAccumulatedBalance: '0' }
  const { data, refetch, isLoading } = useQuery(
    ['useRankReward'],
    async () => {
      if (trader && rewards) {
        const c = getDerifyRewardsContract(rewards)

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

export const useMinimumGrant = ({ rank = '', awards = '', mining = '' } = {}) => {
  const { data, refetch, isLoading } = useQuery(
    ['useMinimumGrant'],
    async () => {
      if (rank && awards && mining) {
        const c1 = getDerifyPmrContract(mining)
        const c2 = getDerifyRankContract(rank)
        const c3 = getDerifyBRewardsContract(awards)

        const res1 = await c1.minGrantAmount()
        const res2 = await c2.minGrantAmount()
        const res3 = await c3.minGrantAmount()

        return [
          formatUnits(res1, PLATFORM_TOKEN.precision),
          formatUnits(res2, PLATFORM_TOKEN.precision),
          formatUnits(res3, PLATFORM_TOKEN.precision)
        ]
      }
      return ['0', '0', '0']
    },
    {
      retry: false,
      initialData: ['0', '0', '0'],
      refetchInterval: 60000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const usePositionInfo = (factoryConfig?: Record<string, any>) => {
  let output = initial()
  const { data, refetch } = useQuery(
    ['usePositionInfo'],
    async () => {
      if (factoryConfig && factoryConfig[DEFAULT_MARGIN_TOKEN.symbol].BTC) {
        const calls = Object.values(factoryConfig).map((quotes: string, j) =>
          Object.values(quotes).map((quote, k) => ({
            name: 'getSideTotalAmount',
            address: quote,
            quoteToken: Object.keys(quotes)[k],
            marginToken: Object.keys(factoryConfig)[j]
          }))
        )
        const flatterCalls = flatten(calls)

        const response = await multicall(DerifyDerivativeAbi, flatterCalls)

        if (response.length > 0) {
          const _chunk = chunk(response, response.length / 2)
          _chunk.forEach((values: any, index: number) => {
            const sum = values.reduce((s1: number, [longTotalAmount, shortTotalAmount]: any[]) => {
              const s2 = bnPlus(formatUnits(longTotalAmount, 8), formatUnits(shortTotalAmount, 8))
              return bnPlus(s1, s2)
            }, 0)
            output = {
              ...output,
              [Object.keys(factoryConfig)[index]]: sum
            }
          })

          // console.info(output)

          return output
        }

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

  return { data, refetch }
}
