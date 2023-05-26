import { useEffect, useMemo } from 'react'
import { useEffectOnce } from 'react-use'

import { useMarginTokenStore, useProtocolConfigStore, useQuoteTokenStore } from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { useDerivativeListStore } from '@/store/useDerivativeList'
import { useMarginTokenListStore } from '@/store/useMarginTokenList'

export const useMarginLoading = () => {
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)
  const updateMarginToken = useMarginTokenStore((state: MarginTokenState) => state.updateMarginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const getMarginTokenList = useMarginTokenListStore((state) => state.getMarginTokenList)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const getDerivativeList = useDerivativeListStore((state) => state.getDerivativeList)
  const getDerAddressList = useDerivativeListStore((state) => state.getDerAddressList)
  const resetDerivative = useDerivativeListStore((state) => state.reset)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getProtocolConfig = useProtocolConfigStore((state) => state.getProtocolConfig)

  useEffectOnce(() => {
    void getMarginTokenList()
  })

  useEffect(() => {
    if (derivativeList.length) {
      const { name, token } = derivativeList[0]
      updateQuoteToken({ symbol: name, address: token })
    } else {
      updateQuoteToken({ symbol: '', address: '' })
    }
  }, [derivativeList])

  useEffect(() => {
    if (marginToken.address) {
      const { address } = marginToken
      void getProtocolConfig(address)
      void getDerivativeList(address)
    } else if (marginTokenList.length) {
      const { logo, symbol, margin_token } = marginTokenList[0]
      updateMarginToken({ logo, symbol, address: margin_token })
      void getProtocolConfig(margin_token)
      void getDerivativeList(margin_token)
    }
  }, [marginToken, marginTokenList])

  useEffect(() => {
    if (protocolConfig) {
      if (derivativeList.length) {
        void getDerAddressList(protocolConfig.factory, derivativeList)
      } else {
        void resetDerivative({ derAddressList: null })
      }
    }
  }, [protocolConfig, derivativeList])

  const isAccessible = useMemo(() => {
    return marginTokenList.length > 0 && !!marginToken
  }, [marginToken, marginTokenList])

  return {
    isAccessible
  }
}
