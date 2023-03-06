import { useMemo } from 'react'

import { MarginTokenKeys } from '@/typings'
import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { useConfigInfo, useMarginToken, usePairsInfo, useQuoteToken } from '@/zustand'

export const useMatchConf = () => {
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const spotPrices = usePairsInfo((state) => state.spotPrices)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)
  const openingMaxLimit = useConfigInfo((state) => state.openingMaxLimit)
  const openingMaxLimitLoaded = useConfigInfo((state) => state.openingMaxLimitLoaded)

  const spotPrice = useMemo(() => {
    return spotPrices[marginToken][quoteToken]
  }, [spotPrices, marginToken, quoteToken])

  const _factoryConfig = useMemo(() => {
    if (factoryConfigLoaded && factoryConfig) return factoryConfig[marginToken][quoteToken]
  }, [quoteToken, marginToken, factoryConfig, factoryConfigLoaded])

  const _protocolConfig = useMemo(() => {
    if (protocolConfigLoaded && protocolConfig) return protocolConfig[marginToken]
  }, [quoteToken, marginToken, protocolConfig, protocolConfigLoaded])

  const _openingMaxLimit = useMemo(() => {
    if (openingMaxLimitLoaded) return openingMaxLimit[marginToken][quoteToken]
  }, [quoteToken, marginToken, openingMaxLimit, openingMaxLimitLoaded])

  return {
    spotPrice,
    quoteToken,
    marginToken,
    factoryConfig: _factoryConfig,
    protocolConfig: _protocolConfig,
    openingMaxLimit: _openingMaxLimit
  }
}

export const useSpotPrice = (quoteToken = QUOTE_TOKENS[0].symbol, marginToken = MARGIN_TOKENS[0].symbol) => {
  const spotPrices = usePairsInfo((state) => state.spotPrices)
  const spotPricesLoaded = usePairsInfo((state) => state.spotPricesLoaded)

  const spotPrice = useMemo(() => {
    if (spotPricesLoaded) return spotPrices[marginToken][quoteToken]
    return 0
  }, [spotPrices, marginToken, quoteToken, spotPricesLoaded])

  const _spotPrices = useMemo(() => {
    return spotPrices[marginToken]
  }, [spotPrices, marginToken])

  return {
    spotPrice,
    spotPrices: _spotPrices
  }
}

export const useFactoryConf = () => {
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)

  const _factoryConfig = useMemo(() => {
    if (factoryConfigLoaded && factoryConfig) return factoryConfig[marginToken][quoteToken]
  }, [quoteToken, marginToken, factoryConfig, factoryConfigLoaded])

  return {
    factoryConfig: _factoryConfig,
    quoteToken,
    marginToken
  }
}

export const useProtocolConf = () => {
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)

  const _protocolConfig = useMemo(() => {
    if (protocolConfigLoaded && protocolConfig) return protocolConfig[marginToken]
  }, [quoteToken, marginToken, protocolConfig, protocolConfigLoaded])

  return {
    protocolConfig: _protocolConfig,
    quoteToken,
    marginToken
  }
}

export const useProtocolConf1 = (quoteToken = QUOTE_TOKENS[0].symbol, marginToken = MARGIN_TOKENS[0].symbol) => {
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)

  const _protocolConfig = useMemo(() => {
    if (protocolConfigLoaded && protocolConfig) return protocolConfig[marginToken as MarginTokenKeys]
  }, [quoteToken, marginToken, protocolConfig, protocolConfigLoaded])

  return {
    protocolConfig: _protocolConfig,
    quoteToken,
    marginToken
  }
}

export const usePCFRatioConf = () => {
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const pcfRatios = usePairsInfo((state) => state.pcfRatios)
  const pcfRatiosLoaded = usePairsInfo((state) => state.pcfRatiosLoaded)

  const pcfRatio = useMemo(() => {
    if (pcfRatiosLoaded) return pcfRatios[marginToken][quoteToken]
  }, [quoteToken, marginToken, pcfRatios, pcfRatiosLoaded])

  return {
    pcfRatio,
    quoteToken,
    marginToken
  }
}
