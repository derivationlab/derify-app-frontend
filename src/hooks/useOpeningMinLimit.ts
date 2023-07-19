import { useEffect, useState } from 'react'

import { getExchangeContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

export const useOpeningMinLimit = (exchange?: string) => {
  const [openingMinLimit, setOpeningMinLimit] = useState<string>('0')

  useEffect(() => {
    const func = async (address: string) => {
      const contract = getExchangeContract(address)
      const response = await contract.minOpenAmount()
      setOpeningMinLimit(formatUnits(response, 8))
    }

    if (exchange) {
      void func(exchange)
    }
  }, [exchange])

  return {
    openingMinLimit
  }
}
