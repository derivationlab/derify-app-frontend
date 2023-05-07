import { useMemo } from 'react'

import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, QuoteTokenKeys } from '@/typings'
import { useConfigInfoStore, usePairsInfoStore } from '@/store'

export const useFactoryConf = (marginToken = MARGIN_TOKENS[0].symbol, quoteToken = QUOTE_TOKENS[0].symbol) => {
  const factoryConfig = useConfigInfoStore((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfoStore((state) => state.factoryConfigLoaded)

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
  const protocolConfig = useConfigInfoStore((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfoStore((state) => state.protocolConfigLoaded)

  const _protocolConfig = useMemo(() => {
    if (protocolConfigLoaded && protocolConfig) return protocolConfig[marginToken as MarginTokenKeys]
  }, [marginToken, protocolConfig, protocolConfigLoaded])

  return {
    protocolConfig: _protocolConfig
  }
}

export const usePCFRatioConf = (quoteToken = QUOTE_TOKENS[0].symbol, marginToken = MARGIN_TOKENS[0].symbol) => {
  const pcfRatios = usePairsInfoStore((state) => state.pcfRatios)
  const pcfRatiosLoaded = usePairsInfoStore((state) => state.pcfRatiosLoaded)

  const pcfRatio = useMemo(() => {
    if (pcfRatiosLoaded) return pcfRatios[marginToken][quoteToken]
  }, [quoteToken, marginToken, pcfRatios, pcfRatiosLoaded])

  return {
    pcfRatio,
    pcfRatiosLoaded
  }
}

export const useIndicatorsConf = (quoteToken = QUOTE_TOKENS[0].symbol) => {
  const indicators = usePairsInfoStore((state) => state.indicators)
  const indicatorsLoaded = usePairsInfoStore((state) => state.indicatorsLoaded)

  const _indicators = useMemo(() => {
    if (indicatorsLoaded) return indicators[quoteToken]
  }, [quoteToken, indicators, indicatorsLoaded])

  return {
    indicators: _indicators
  }
}

export const useOpeningMaxLimit = (quoteToken = QUOTE_TOKENS[0].symbol, marginToken = MARGIN_TOKENS[0].symbol) => {
  const openingMaxLimit = useConfigInfoStore((state) => state.openingMaxLimit)
  const openingMaxLimitLoaded = useConfigInfoStore((state) => state.openingMaxLimitLoaded)

  const _openingMaxLimit = useMemo(() => {
    if (openingMaxLimitLoaded) return openingMaxLimit[marginToken as MarginTokenKeys][quoteToken as QuoteTokenKeys]
  }, [quoteToken, marginToken, openingMaxLimit, openingMaxLimitLoaded])

  return {
    openingMaxLimit: _openingMaxLimit
  }
}
