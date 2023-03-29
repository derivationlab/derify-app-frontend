import { useMemo } from 'react'

import { useConfigInfo, usePairsInfo } from '@/store'
import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, QuoteTokenKeys } from '@/typings'

export const useOpeningMaxLimit = (quoteToken = QUOTE_TOKENS[0].symbol, marginToken = MARGIN_TOKENS[0].symbol) => {
  const openingMaxLimit = useConfigInfo((state) => state.openingMaxLimit)
  const openingMaxLimitLoaded = useConfigInfo((state) => state.openingMaxLimitLoaded)

  const _openingMaxLimit = useMemo(() => {
    if (openingMaxLimitLoaded) return openingMaxLimit[marginToken as MarginTokenKeys][quoteToken as QuoteTokenKeys]
  }, [quoteToken, marginToken, openingMaxLimit, openingMaxLimitLoaded])

  return {
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

export const useFactoryConf = (quoteToken = QUOTE_TOKENS[0].symbol, marginToken = MARGIN_TOKENS[0].symbol) => {
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)

  const match = useMemo(() => {
    if (factoryConfigLoaded && factoryConfig) return factoryConfig[marginToken as MarginTokenKeys]
  }, [marginToken, factoryConfig, factoryConfigLoaded])

  const _factoryConfig = useMemo(() => {
    if (match) return match[quoteToken as QuoteTokenKeys]
  }, [match, quoteToken])

  return {
    match,
    factoryConfig: _factoryConfig
  }
}

export const useProtocolConf = (marginToken = MARGIN_TOKENS[0].symbol) => {
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)

  const _protocolConfig = useMemo(() => {
    if (protocolConfigLoaded && protocolConfig) return protocolConfig[marginToken as MarginTokenKeys]
  }, [marginToken, protocolConfig, protocolConfigLoaded])

  return {
    protocolConfig: _protocolConfig
  }
}

export const usePCFRatioConf = (quoteToken = QUOTE_TOKENS[0].symbol, marginToken = MARGIN_TOKENS[0].symbol) => {
  const pcfRatios = usePairsInfo((state) => state.pcfRatios)
  const pcfRatiosLoaded = usePairsInfo((state) => state.pcfRatiosLoaded)

  const pcfRatio = useMemo(() => {
    if (pcfRatiosLoaded) return pcfRatios[marginToken][quoteToken]
  }, [quoteToken, marginToken, pcfRatios, pcfRatiosLoaded])

  return {
    pcfRatio,
    pcfRatiosLoaded
  }
}

export const useIndicatorsConf = (quoteToken = QUOTE_TOKENS[0].symbol) => {
  const indicators = usePairsInfo((state) => state.indicators)
  const indicatorsLoaded = usePairsInfo((state) => state.indicatorsLoaded)

  const _indicators = useMemo(() => {
    if (indicatorsLoaded) return indicators[quoteToken]
  }, [quoteToken, indicators, indicatorsLoaded])

  return {
    indicators: _indicators
  }
}
