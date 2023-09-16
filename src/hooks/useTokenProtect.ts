import { useEffect } from 'react'
import { useBoolean } from 'react-use'

// import { searchDerivative } from '@/api'
import { useDerivativeListStore, useQuoteTokenStore } from '@/store'
import { QuoteTokenState } from '@/store/types'

export const useTokenProtect = () => {
  const [checking, setChecking] = useBoolean(true)
  const derivativeList = useDerivativeListStore((state) => state.derivativeListOpen)
  const derivativeListLoaded = useDerivativeListStore((state) => state.derivativeListLoaded)
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)

  /**
   * TODO:
   * If the transaction pair cached by the browser is found to be off the shelf (open or not open),
   * other transaction pair information will be displayed
   *
   * FIXME：
   * xx/xx - api error
   */
  const checkTradingPairStatus = async () => {
    // const { data } = await searchDerivative(quoteToken.margin, 'xrpd')
    // if (!Boolean(data[0]?.open)) {
    //   const { name, token, price_decimals: decimals, derivative } = derivativeList[0]
    //   updateQuoteToken({ name, token, decimals, derivative, margin: quoteToken.margin })
    // }
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
