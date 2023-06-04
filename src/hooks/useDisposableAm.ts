import { useEffect, useState } from 'react'

import { PositionOrderTypes, Rec } from '@/typings'
import { getDerifyExchangeContract } from '@/utils/contractHelpers'
import { formatUnits, inputParameterConversion } from '@/utils/tools'

export const useDisposableAm = (
  price: string,
  trader: string,
  exchange: string,
  quoteToken: Rec,
  marginToken: Rec,
  leverageNow: number,
  openingType: PositionOrderTypes
) => {
  const [disposableAm, setDisposableAm] = useState<Rec | null>(null)

  const func = async () => {
    const contract = getDerifyExchangeContract(exchange)
    const _price = inputParameterConversion(price, 8)
    const _leverageNow = inputParameterConversion(leverageNow, 8)

    try {
      const data = await contract.getTraderOpenUpperBound(quoteToken.token, trader, openingType, _price, _leverageNow)

      const { size, amount } = data

      setDisposableAm({
        [quoteToken.symbol]: formatUnits(String(size), 8),
        [marginToken.symbol]: formatUnits(String(amount), 8)
      })
    } catch (e) {
      setDisposableAm({
        [quoteToken.symbol]: '0',
        [marginToken.symbol]: '0'
      })
    }
  }

  useEffect(() => {
    if (trader && exchange && Number(leverageNow) > 0) {
      void func()
    }
  }, [price, trader, exchange, quoteToken, marginToken, leverageNow])

  return {
    loaded: !disposableAm,
    disposableAm,
    getDisposableAm: func
  }
}
