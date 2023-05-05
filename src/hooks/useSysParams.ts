import { isEmpty } from 'lodash'
import { useQuery } from '@tanstack/react-query'

import contracts from '@/config/contracts'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'
import { ProtocolConfig } from '@/typings'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { getDerifyBRewardsContract, getDerifyPmrContract, getDerifyRankContract } from '@/utils/contractHelpers'

import derifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import derifyClearingAbi from '@/config/abi/DerifyClearing.json'
import derifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

export const initBuyBackParams = {
  buyback_period: '0',
  buyback_sllipage: '0'
}

export const initRewardsParams = {
  blockTime: '0',
  bondAnnualInterestRate: '0'
}

export const initExchangeParams = {
  thetaRatio: '0',
  minOpenAmount: '0',
  buyBackFundRatio: '0'
}

export const initProtocolParams = {
  unitStakingNumber: '0',
  brokerApplyNumber: '0',
  brokerValidUnitNumber: '0'
}

export const initClearingParams = {
  gasFeeRewardRatio: '0',
  marginMaintenanceRatio: '0',
  marginLiquidationRatio: '0',
  marginMaintenanceRatioMultiple: '0'
}

export const initGrantPlanParams = {
  rank: '0',
  awards: '0',
  mining: '0'
}

export const initTradePairParams = {
  kRatio: '0',
  gRatio: '0',
  roRatio: '0',
  maxLeverage: '0',
  tradingFeeRatio: '0',
  maxLimitOrderSize: '0',
  tradingFeePmrRatio: '0',
  tradingFeeBrokerRatio: '0',
  tradingFeeInusranceRatio: '0'
}

export const useRewardsParams = (rewards?: string) => {
  const { data, refetch, isLoading } = useQuery(
    ['useRewardsParams'],
    async (): Promise<typeof initRewardsParams> => {
      if (rewards) {
        const base = { address: rewards }
        const calls = [
          {
            name: 'blockTime',
            ...base
          },
          {
            name: 'bondAnnualInterestRate',
            ...base
          }
        ]

        const response = await multicall(derifyRewardsAbi, calls)

        const [[blockTime], [bondAnnualInterestRate]] = response

        return {
          ...initRewardsParams,
          blockTime: String(blockTime),
          bondAnnualInterestRate: formatUnits(bondAnnualInterestRate, 8)
        }
      }

      return initRewardsParams
    },
    {
      retry: 0,
      initialData: initRewardsParams,
      refetchInterval: false,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const useExchangeParams = (exchange?: string) => {
  const { data, refetch, isLoading } = useQuery(
    ['useExchangeParams'],
    async (): Promise<typeof initExchangeParams> => {
      if (exchange) {
        const base = { address: exchange }
        const calls = [
          {
            name: 'thetaRatio',
            ...base
          },
          {
            name: 'buyBackFundRatio',
            ...base
          },
          {
            name: 'minOpenAmount',
            ...base
          }
        ]

        const response = await multicall(derifyExchangeAbi, calls)

        const [[thetaRatio], [buyBackFundRatio], [minOpenAmount]] = response

        return {
          ...initExchangeParams,
          thetaRatio: formatUnits(thetaRatio, 8),
          minOpenAmount: formatUnits(minOpenAmount, 8),
          buyBackFundRatio: formatUnits(buyBackFundRatio, 8)
        }
      }

      return initExchangeParams
    },
    {
      retry: 0,
      initialData: initExchangeParams,
      refetchInterval: false,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const useClearingParams = (clearing?: string) => {
  const { data, refetch, isLoading } = useQuery(
    ['useClearingParams'],
    async (): Promise<typeof initClearingParams> => {
      if (clearing) {
        const base = { address: clearing }
        const calls = [
          {
            name: 'marginMaintenanceRatio',
            ...base
          },
          {
            name: 'marginMaintenanceRatioMultiple',
            ...base
          },
          {
            name: 'marginLiquidationRatio',
            ...base
          },
          {
            name: 'gasFeeRewardRatio',
            ...base
          }
        ]

        const response = await multicall(derifyClearingAbi, calls)

        const [
          [marginMaintenanceRatio],
          [marginMaintenanceRatioMultiple],
          [marginLiquidationRatio],
          [gasFeeRewardRatio]
        ] = response

        return {
          ...initClearingParams,
          gasFeeRewardRatio: formatUnits(gasFeeRewardRatio, 8),
          marginLiquidationRatio: formatUnits(marginLiquidationRatio, 8),
          marginMaintenanceRatio: formatUnits(marginMaintenanceRatio, 8),
          marginMaintenanceRatioMultiple: formatUnits(marginMaintenanceRatioMultiple, 8)
        }
      }

      return initClearingParams
    },
    {
      retry: 0,
      initialData: initClearingParams,
      refetchInterval: false,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const useProtocolParams = () => {
  const base = { address: contracts.derifyProtocol.contractAddress }
  const calls = [
    {
      name: 'brokerApplyNumber',
      ...base
    },
    {
      name: 'brokerValidUnitNumber',
      ...base
    },
    {
      name: 'unitStakingNumber',
      ...base
    }
  ]

  const { data, isLoading } = useQueryMulticall(derifyProtocolAbi, calls, 30000)

  if (!isLoading && !isEmpty(data)) {
    const [[brokerApplyNumber], [brokerValidUnitNumber], [unitStakingNumber]] = data

    return {
      data: {
        ...initProtocolParams,
        unitStakingNumber: formatUnits(unitStakingNumber),
        brokerApplyNumber: formatUnits(brokerApplyNumber),
        brokerValidUnitNumber: formatUnits(brokerValidUnitNumber)
      },
      isLoading
    }
  }

  return { data: initProtocolParams, isLoading }
}

export const useGrantPlanParams = (config?: ProtocolConfig) => {
  const { data, refetch, isLoading } = useQuery(
    ['useGrantPlanParams'],
    async (): Promise<typeof initGrantPlanParams> => {
      if (config?.rank && config?.mining && config?.awards) {
        const pmrContract = getDerifyPmrContract(config.mining)
        const rankContract = getDerifyRankContract(config.rank)
        const bRewardsContract = getDerifyBRewardsContract(config.awards)

        const rank = await rankContract.minGrantAmount()
        const mining = await pmrContract.minGrantAmount()
        const awards = await bRewardsContract.minGrantAmount()

        return {
          ...initGrantPlanParams,
          rank: formatUnits(mining, 18),
          mining: formatUnits(rank, 18),
          awards: formatUnits(awards, 18)
        }
      }

      return initGrantPlanParams
    },
    {
      retry: 0,
      initialData: initGrantPlanParams,
      refetchInterval: false,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const useTradePairParams = (address?: string) => {
  const { data, refetch, isLoading } = useQuery(
    ['useTradePairParams'],
    async (): Promise<typeof initTradePairParams> => {
      if (address) {
        const base = { address }
        const calls = [
          {
            name: 'tradingFeeRatio',
            ...base
          },
          {
            name: 'tradingFeePmrRatio',
            ...base
          },
          {
            name: 'tradingFeeInusranceRatio',
            ...base
          },
          {
            name: 'tradingFeeBrokerRatio',
            ...base
          },
          {
            name: 'kRatio',
            ...base
          },
          {
            name: 'gRatio',
            ...base
          },
          {
            name: 'roRatio',
            ...base
          },
          {
            name: 'maxLeverage',
            ...base
          },
          {
            name: 'maxLimitOrderSize',
            ...base
          }
        ]

        const response = await multicall(derifyDerivativeAbi, calls)

        const [
          tradingFeeRatio,
          tradingFeePmrRatio,
          tradingFeeInusranceRatio,
          tradingFeeBrokerRatio,
          kRatio,
          gRatio,
          roRatio,
          maxLeverage,
          maxLimitOrderSize
        ] = response

        return {
          ...initTradePairParams,
          kRatio: formatUnits(String(kRatio), 8),
          gRatio: formatUnits(String(gRatio), 8),
          roRatio: formatUnits(String(roRatio), 8),
          maxLeverage: formatUnits(String(maxLeverage), 8),
          tradingFeeRatio: formatUnits(String(tradingFeeRatio), 8),
          maxLimitOrderSize: String(maxLimitOrderSize),
          tradingFeePmrRatio: formatUnits(String(tradingFeePmrRatio), 8),
          tradingFeeBrokerRatio: formatUnits(String(tradingFeeBrokerRatio), 8),
          tradingFeeInusranceRatio: formatUnits(String(tradingFeeInusranceRatio), 8)
        }
      }

      return initTradePairParams
    },
    {
      retry: 0,
      initialData: initTradePairParams,
      refetchInterval: false,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

/**
 getDerivativeParams = async (
 factoryConfig: { [key in QuoteTokenKeys]: string },
 clearing?: string
 ): Promise<Record<string, any>[]> => {
    const keys = Object.keys(factoryConfig)
    const calls = keys.map((k: string) => {
      const base = {
        address: factoryConfig[k as QuoteTokenKeys],
        clearing,
        quoteToken: k,
        aggregator: aggregatorsAddr[k]
      }

      return [
        {
          name: 'exchange',
          ...base
        },
        {
          name: 'tradingFeeRatio',
          ...base
        },
        {
          name: 'tradingFeePmrRatio',
          ...base
        },
        {
          name: 'tradingFeeInusranceRatio',
          ...base
        },
        {
          name: 'tradingFeeBrokerRatio',
          ...base
        },
        {
          name: 'kRatio',
          ...base
        },
        {
          name: 'gRatio',
          ...base
        },
        {
          name: 'roRatio',
          ...base
        },
        {
          name: 'maxLeverage',
          ...base
        },
        {
          name: 'maxLimitOrderSize',
          ...base
        }
      ]
    })
    const flatterCalls = flatten(calls)

    const response = await multicall(DerifyDerivativeAbi, flatterCalls)

    if (!isEmpty(response)) {
      const _chunk = chunk(response, flatterCalls.length / keys.length)
      const output = _chunk.map(
        (
          [
            exchange,
            tradingFeeRatio,
            tradingFeePmrRatio,
            tradingFeeInusranceRatio,
            tradingFeeBrokerRatio,
            kRatio,
            gRatio,
            roRatio,
            maxLeverage,
            maxLimitOrderSize
          ],
          index
        ) => {
          return {
            quote: calls[index][0].quoteToken,
            owner: calls[index][0].address,
            kRatio: safeInterceptionValues(String(kRatio)),
            gRatio: safeInterceptionValues(String(gRatio)),
            roRatio: safeInterceptionValues(String(roRatio)),
            exchange,
            clearing: calls[index][0].clearing,
            aggregator: calls[index][0].aggregator,
            maxLeverage: safeInterceptionValues(String(maxLeverage)),
            tradingFeeRatio: safeInterceptionValues(String(tradingFeeRatio)),
            maxLimitOrderSize: String(maxLimitOrderSize),
            tradingFeePmrRatio: safeInterceptionValues(String(tradingFeePmrRatio)),
            tradingFeeBrokerRatio: safeInterceptionValues(String(tradingFeeBrokerRatio)),
            tradingFeeInusranceRatio: safeInterceptionValues(String(tradingFeeInusranceRatio))
          }
        }
      )

      console.info(output)
      this.pairsParams = output

      return output
    }

    return []
  }

 */
