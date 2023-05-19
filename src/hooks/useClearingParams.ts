import { useEffect, useState } from 'react'
import { formatUnits } from '@/utils/tools'
import multicall from '@/utils/multicall'
import derifyClearingAbi from '@/config/abi/DerifyClearing.json'

const initClearingParams = {
  gasFeeRewardRatio: '0',
  marginMaintenanceRatio: '0',
  marginLiquidationRatio: '0',
  marginMaintenanceRatioMultiple: '0'
}

export const getClearingParams = async (address: string) => {
  const calls = [
    {
      name: 'marginMaintenanceRatio',
      address
    },
    {
      name: 'marginMaintenanceRatioMultiple',
      address
    },
    {
      name: 'marginLiquidationRatio',
      address
    },
    {
      name: 'gasFeeRewardRatio',
      address
    }
  ]

  const response = await multicall(derifyClearingAbi, calls)

  const [[marginMaintenanceRatio], [marginMaintenanceRatioMultiple], [marginLiquidationRatio], [gasFeeRewardRatio]] =
    response

  return {
    ...initClearingParams,
    gasFeeRewardRatio: formatUnits(gasFeeRewardRatio, 8),
    marginLiquidationRatio: formatUnits(marginLiquidationRatio, 8),
    marginMaintenanceRatio: formatUnits(marginMaintenanceRatio, 8),
    marginMaintenanceRatioMultiple: formatUnits(marginMaintenanceRatioMultiple, 8)
  }
}

export const useClearingParams = (address?: string) => {
  const [clearingParams, setClearingParams] = useState<typeof initClearingParams>(initClearingParams)

  const _getClearingParams = async (address: string) => {
    const data = await getClearingParams(address)
    setClearingParams(data)
  }

  useEffect(() => {
    if (address) void _getClearingParams(address)
  }, [address])

  return {
    clearingParams
  }
}
