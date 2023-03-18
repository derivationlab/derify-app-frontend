import { isEmpty } from 'lodash'
import { useQuery } from '@tanstack/react-query'

import multicall from '@/utils/multicall'
import contracts from '@/config/contracts'
import { formatUnits } from '@/utils/tools'
import { MarginToken, MarginTokenKeys, MarginTokenWithQuote } from '@/typings'
import { findToken, MARGIN_TOKENS, PLATFORM_TOKEN } from '@/config/tokens'

import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

const initial1 = (): MarginTokenWithQuote => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0'
    }
  })

  return value
}

const initial2 = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: {
        origin: '0',
        [t.symbol]: '0'
      }
    }
  })

  return value
}

export const useAllMarginBalances = (trader?: string) => {
  let output = initial1()
  const { data, refetch, isLoading } = useQuery(
    ['useAllMarginBalances'],
    async () => {
      if (trader) {
        const base = {
          name: 'getAllMarginBalances',
          address: contracts.derifyProtocol.contractAddress
        }
        const calls = MARGIN_TOKENS.map((token) => ({
          ...base,
          params: [token.tokenAddress, [trader], []]
        }))

        console.info(calls)

        const res = await multicall(DerifyProtocolAbi, calls)

        console.info(res)

        if (res.length > 0) {
          res.forEach((margin: any) => {
            const [marginToken, , balances] = margin
            const M = findToken(marginToken).symbol
            output = {
              ...output,
              [M]: formatUnits(String(balances[0]), 8)
            }
          })
        }

        return output
      }

      return initial1()
    },
    {
      retry: false,
      initialData: initial1(),
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const useAllTraderRewards = (trader?: string, config?: Record<string, any>) => {
  let output = initial2()

  const { data, refetch, isLoading } = useQuery(
    ['useAllTraderRewards'],
    async () => {
      if (config) {
        const _config = Object.values(config)
        const _isExist = _config.find((c) => c.rewards)

        if (trader && _isExist) {
          const base = { name: 'getPositionReward', params: [trader] }
          const calls = _config.map((c, index) => ({
            ...base,
            address: c.rewards,
            marginToken: Object.keys(config)[index]
          }))

          const response = await multicall(DerifyRewardsAbi, calls)

          if (!isEmpty(response)) {
            response.forEach((data: any, index: number) => {
              const { drfAccumulatedBalance, drfBalance, marginTokenAccumulatedBalance, marginTokenBalance } = data
              const _drfBalance = formatUnits(String(drfBalance), 8)
              const _marginTokenBalance = formatUnits(String(marginTokenBalance), 8)
              const _drfAccumulatedBalance = formatUnits(String(drfAccumulatedBalance), 8)
              const _marginTokenAccumulatedBalance = formatUnits(String(marginTokenAccumulatedBalance), 8)

              output = {
                ...output,
                [calls[index].marginToken]: {
                  origin: _drfBalance,
                  [calls[index].marginToken]: _marginTokenBalance
                }
              }
            })

            // console.info(output)
            return output
          }

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

  return { data, refetch, isLoading }
}

export const useAllBrokerRewards = (trader?: string, config?: Record<string, any>) => {
  let output = initial2()

  const { data, refetch, isLoading } = useQuery(
    ['useAllBrokerRewards'],
    async () => {
      if (config) {
        const _config = Object.values(config)
        const _isExist = _config.find((c) => c.rewards)

        if (trader && _isExist) {
          const base = { name: 'getBrokerReward', params: [trader] }
          const calls = _config.map((c, index) => ({
            ...base,
            address: c.rewards,
            marginToken: Object.keys(config)[index]
          }))

          const response = await multicall(DerifyRewardsAbi, calls)

          if (!isEmpty(response)) {
            response.forEach((data: any, index: number) => {
              const [
                { accumulatedDrfReward, accumulatedMarginTokenReward, drfRewardBalance, marginTokenRewardBalance }
              ] = data
              const _drfRewardBalance = formatUnits(String(drfRewardBalance), 18)
              const _accumulatedDrfReward = formatUnits(String(accumulatedDrfReward), 18)
              const _marginTokenRewardBalance = formatUnits(String(marginTokenRewardBalance), 18)
              const _accumulatedMarginTokenReward = formatUnits(String(accumulatedMarginTokenReward), 18)
              output = {
                ...output,
                [calls[index].marginToken]: {
                  origin: _drfRewardBalance,
                  [calls[index].marginToken]: _marginTokenRewardBalance
                }
              }
            })

            console.info(output)
            return output
          }

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

  return { data, refetch, isLoading }
}
