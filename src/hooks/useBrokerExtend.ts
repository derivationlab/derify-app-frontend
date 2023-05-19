import { useEffect, useState } from 'react'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import multicall from '@/utils/multicall'
import { bnDiv, bnMul, formatUnits } from '@/utils/tools'

export const initial = {
  burnLimitAmount: '0',
  burnLimitPerDay: 0
}

export const useBrokerExtend = () => {
  const [brokerExtend, setBrokerExtend] = useState<typeof initial>(initial)

  const getBrokerExtend = async () => {
    const base = { address: contracts.derifyProtocol.contractAddress }
    const calls = [
      {
        name: 'brokerApplyNumber',
        ...base
      },
      {
        name: 'brokerValidUnitNumber',
        ...base
      }
    ]

    const response = await multicall(derifyProtocolAbi, calls)

    const [brokerApplyNumber, brokerValidUnitNumber] = response

    setBrokerExtend({
      burnLimitAmount: formatUnits(String(brokerApplyNumber)),
      burnLimitPerDay: Math.ceil(bnDiv(bnMul(String(brokerValidUnitNumber), 24 * 3600), 3 * Math.pow(10, 8)) as any)
    })
  }

  useEffect(() => {
    void getBrokerExtend()
  }, [])

  return {
    brokerExtend
  }
}
