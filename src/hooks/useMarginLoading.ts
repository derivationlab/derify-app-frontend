import { useEffect, useMemo } from 'react'
import { useEffectOnce } from 'react-use'

import { useMarginTokenStore, useProtocolConfigStore, useQuoteTokenStore } from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { useDerivativeListStore } from '@/store/useDerivativeList'
import { useMarginTokenListStore } from '@/store/useMarginTokenList'

export const useMarginLoading = () => {
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const updateMarginToken = useMarginTokenStore((state: MarginTokenState) => state.updateMarginToken)
  const getMarginTokenList = useMarginTokenListStore((state) => state.getMarginTokenList)
  const getMarginAddressList = useMarginTokenListStore((state) => state.getMarginAddressList)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const getDerivativeList = useDerivativeListStore((state) => state.getDerivativeList)
  const getDerAddressList = useDerivativeListStore((state) => state.getDerAddressList)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getProtocolConfig = useProtocolConfigStore((state) => state.getProtocolConfig)

  useEffectOnce(() => {
    void getMarginTokenList()
    void getMarginAddressList()
  })

  useEffect(() => {
    if (marginToken.address) {
      const { address } = marginToken
      void getProtocolConfig(address)
      void getDerivativeList(address)
    }
  }, [marginToken])

  useEffect(() => {
    const len = derivativeList.length
    const { token } = quoteToken
    if (len && token) {
      const find = derivativeList.find((d) => d.name === quoteToken.symbol)
      if (!find) updateQuoteToken({ symbol: derivativeList[0].name, token: derivativeList[0].token })
    }
  }, [derivativeList])

  useEffect(() => {
    const len = derivativeList.length
    const { token } = quoteToken
    if (len && !token) {
      const { name, token } = derivativeList[0]
      updateQuoteToken({ symbol: name, token })
    }
  }, [quoteToken, derivativeList])

  // Initialize margin default information
  useEffect(() => {
    const len = marginTokenList.length
    const { address } = marginToken
    if (len && !address) {
      const { logo, symbol, margin_token } = marginTokenList[0]
      updateMarginToken({ logo, symbol, address: margin_token })
    }
  }, [marginToken, marginTokenList])

  useEffect(() => {
    if (protocolConfig) {
      void getDerAddressList(protocolConfig.factory)
    }
  }, [protocolConfig, derivativeList])

  const isAccessible = useMemo(() => {
    return marginTokenList.length > 0 && !!marginToken
  }, [marginToken, marginTokenList])

  return {
    isAccessible
  }
}
