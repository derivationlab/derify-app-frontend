import { useEffect, useMemo } from 'react'
import { useEffectOnce } from 'react-use'

import { useMarginTokenStore, useProtocolConfigStore, useQuoteTokenStore } from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { useDerivativeListStore } from '@/store/useDerivativeList'
import { useMarginTokenListStore } from '@/store/useMarginTokenList'

export const useMarginLoading = () => {
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const updateMarginToken = useMarginTokenStore((state: MarginTokenState) => state.updateMarginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const getMarginTokenList = useMarginTokenListStore((state) => state.getMarginTokenList)
  const getMarginAddressList = useMarginTokenListStore((state) => state.getMarginAddressList)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const getDerivativeList = useDerivativeListStore((state) => state.getDerivativeList)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getProtocolConfig = useProtocolConfigStore((state) => state.getProtocolConfig)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)

  useEffectOnce(() => {
    void getMarginTokenList()
    void getMarginAddressList()
  })

  // Initialize margin token default information
  useEffect(() => {
    const len = marginTokenList.length
    const { address } = marginToken
    if (len && !address) {
      const { logo, symbol, margin_token, amount_decimals } = marginTokenList[0]
      updateMarginToken({ logo, symbol, address: margin_token, decimals: amount_decimals })
    }
  }, [marginToken, marginTokenList])

  // Initialize margin token with protocol config
  useEffect(() => {
    if (marginToken) void getProtocolConfig(marginToken.address)
  }, [marginToken])

  // Initialize quote token default information
  useEffect(() => {
    const len = derivativeList.length
    if (len) {
      const { name, token, price_decimals, derivative } = derivativeList[0]
      updateQuoteToken({
        token,
        symbol: name,
        decimals: price_decimals,
        derivative
      })
    }
  }, [derivativeList])

  // Get trading pair data
  useEffect(() => {
    if (protocolConfig && marginToken) void getDerivativeList(marginToken.address, protocolConfig.factory)
  }, [marginToken, protocolConfig])

  const isAccessible = useMemo(() => {
    return marginTokenList.length > 0 && !!marginToken
  }, [marginToken, marginTokenList])

  return {
    isAccessible
  }
}
