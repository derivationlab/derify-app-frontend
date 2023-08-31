import { useDerivativeListStore, useQuoteTokenStore } from '@/store'
import { searchDerivative } from '@/api'
import { QuoteTokenState } from '@/store/types'
import { useEffect } from 'react'
import { useBoolean } from 'react-use'

export const useTokenProtect = () => {
  const [checking, setChecking] = useBoolean(true)
  const derivativeList = useDerivativeListStore((state) => state.derivativeListOpen)
  const derivativeListLoaded = useDerivativeListStore((state) => state.derivativeListLoaded)
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)

  // open or not open
  // xrp/usd - error
  // 地址搜索 - 不支持
  const checkTradingPairStatus = async () => {
    const { data } = await searchDerivative(quoteToken.margin, 'xrpd')
    if (!Boolean(data[0]?.open)) {
      const { name, token, price_decimals: decimals, derivative } = derivativeList[0]
      updateQuoteToken({ name, token, decimals, derivative, margin: quoteToken.margin })
    }
    setChecking(false)
  }

  useEffect(() => {
    if (derivativeListLoaded) {
      void checkTradingPairStatus()
    }
  }, [derivativeListLoaded])

  return {
    checking: !derivativeListLoaded || checking,
    quoteToken,
    updateQuoteToken,
    derivativeList,
    derivativeListLoaded
  }
}