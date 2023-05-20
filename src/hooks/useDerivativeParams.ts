import { useEffect, useState } from 'react'

import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

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

export const useDerivativeParams = (address: string) => {
  const [derivativeParams, setDerivativeParams] = useState<typeof initTradePairParams>(initTradePairParams)

  const getDerivativeParams = async () => {
    console.info(8989)
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

    setDerivativeParams({
      kRatio: formatUnits(String(kRatio), 8),
      gRatio: formatUnits(String(gRatio), 8),
      roRatio: formatUnits(String(roRatio), 8),
      maxLeverage: formatUnits(String(maxLeverage), 8),
      tradingFeeRatio: formatUnits(String(tradingFeeRatio), 8),
      maxLimitOrderSize: String(maxLimitOrderSize),
      tradingFeePmrRatio: formatUnits(String(tradingFeePmrRatio), 8),
      tradingFeeBrokerRatio: formatUnits(String(tradingFeeBrokerRatio), 8),
      tradingFeeInusranceRatio: formatUnits(String(tradingFeeInusranceRatio), 8)
    })
  }

  useEffect(() => {
    if (address) void getDerivativeParams()
  }, [address])

  return { derivativeParams }
}
