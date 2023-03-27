import { isEmpty } from 'lodash'
import { useQuery } from '@tanstack/react-query'

import multicall from '@/utils/multicall'
import contracts from '@/config/contracts'
import { formatUnits, isLT } from '@/utils/tools'
import { getDerifyExchangeContract } from '@/utils/contractHelpers'
import { MarginToken, MarginTokenKeys } from '@/typings'
import { DEFAULT_MARGIN_TOKEN, MARGIN_TOKENS } from '@/config/tokens'

import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

const initial1 = (): MarginToken => {
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
          params: [
            [
              {
                traders: [trader],
                balances: [],
                marginToken: token.tokenAddress
              }
            ]
          ]
        }))

        const res = await multicall(DerifyProtocolAbi, calls)

        if (res.length > 0) {
          res.forEach(([margin]: any[], index: number) => {
            const [{ balances }] = margin
            output = {
              ...output,
              [MARGIN_TOKENS[index].symbol]: formatUnits(String(balances), 8)
            }
          })
        }
        // console.info(output)
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
              const { drfBalance, marginTokenBalance } = data
              const _drfBalance = formatUnits(String(drfBalance), 8)
              const _marginTokenBalance = formatUnits(String(marginTokenBalance), 8)

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
              const [{ drfRewardBalance, marginTokenRewardBalance }] = data
              const _drfRewardBalance = formatUnits(String(drfRewardBalance), 8)
              const _marginTokenRewardBalance = formatUnits(String(marginTokenRewardBalance), 8)

              output = {
                ...output,
                [calls[index].marginToken]: {
                  origin: isLT(_drfRewardBalance, 0) ? '0' : _drfRewardBalance,
                  [calls[index].marginToken]: isLT(_marginTokenRewardBalance, 0) ? '0' : _marginTokenRewardBalance
                }
              }
            })

            return output
          }
        }
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

const innerFunc = async (address: string, trader: string) => {
  const c = getDerifyExchangeContract(address)
  const response = await c.getTraderVariables(trader)
  return response
}

export const useTraderVariables = (trader?: string, config?: Record<string, any>) => {
  let output = initial1()

  const { data, refetch } = useQuery(
    ['useTraderVariables'],
    async () => {
      if (trader && config && config[DEFAULT_MARGIN_TOKEN.symbol].exchange) {
        const promises = Object.keys(config).map(async (key) => [
          await innerFunc(config[key as MarginTokenKeys].exchange, trader).catch(() => null)
        ])

        const response = await Promise.all(promises)

        if (!isEmpty(response)) {
          response.forEach(([data]: any[], index: number) => {
            if (data) {
              const { totalPositionAmount } = data
              output = {
                ...output,
                [Object.keys(config)[index]]: formatUnits(String(totalPositionAmount), 8)
              }
            }
          })

          // console.info(output)
          return output
        }
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

// export const useTraderVariables = (trader?: string, config?: Record<string, any>) => {
//   let output = initial1()
//
//   const { data, refetch } = useQuery(
//     ['useTraderVariables'],
//     async () => {
//       if (trader && config && config[DEFAULT_MARGIN_TOKEN.symbol].exchange) {
//         const calls = Object.keys(config).map((key) => ({
//           name: 'getTraderVariables',
//           params: [trader],
//           address: config[key as MarginTokenKeys].exchange
//         }))
//
//         const response = await multicall(DerifyExchangeAbi, calls)
//
//         if (!isEmpty(response)) {
//           response.forEach((data: any, index: number) => {
//             const { totalPositionAmount } = data
//             output = {
//               ...output,
//               [Object.keys(config)[index]]: formatUnits(String(totalPositionAmount), 8)
//             }
//           })
//
//           // console.info(output)
//           return output
//         }
//       }
//
//       return output
//     },
//     {
//       retry: false,
//       initialData: output,
//       refetchInterval: 6000,
//       keepPreviousData: true,
//       refetchOnWindowFocus: false
//     }
//   )
//
//   return { data, refetch }
// }
