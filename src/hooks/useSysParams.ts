import { isEmpty } from 'lodash'
import { useQuery } from '@tanstack/react-query'

import contracts from '@/config/contracts'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'
import { ProtocolConfig } from '@/typings'
import { getBuyBackParams } from '@/api'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { getDerifyBRewardsContract, getDerifyPmrContract, getDerifyRankContract } from '@/utils/contractHelpers'

import derifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import derifyClearingAbi from '@/config/abi/DerifyClearing.json'
import derifyExchangeAbi from '@/config/abi/DerifyExchange.json'

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
      refetchInterval: 30000,
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
      refetchInterval: 30000,
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
      refetchInterval: 30000,
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
      refetchInterval: 30000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}

export const useBuyBackParams = (marginToken: string) => {
  const { data, refetch, isLoading } = useQuery(
    ['useBuyBackParams'],
    async (): Promise<typeof initBuyBackParams> => {
      const { data } = await getBuyBackParams(marginToken)
      return data
    },
    {
      retry: 0,
      initialData: initBuyBackParams,
      refetchInterval: 30000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}
