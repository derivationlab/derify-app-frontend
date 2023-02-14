import { useMemo } from 'react'

import { useConfigInfo, useMarginToken, usePairsInfo, useQuoteToken } from '@/zustand'

export const useMatchConf = () => {
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const spotPrices = usePairsInfo((state) => state.spotPrices)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)

  const spotPrice = useMemo(() => {
    return spotPrices[marginToken][quoteToken]
  }, [spotPrices, marginToken, quoteToken])

  const _factoryConfig = useMemo(() => {
    if (factoryConfigLoaded && factoryConfig) return factoryConfig[marginToken][quoteToken]
  }, [quoteToken, marginToken, factoryConfig, factoryConfigLoaded])

  const _protocolConfig = useMemo(() => {
    if (protocolConfigLoaded && protocolConfig) return protocolConfig[marginToken]
  }, [quoteToken, marginToken, protocolConfig, protocolConfigLoaded])

  return {
    spotPrice,
    factoryConfig: _factoryConfig,
    protocolConfig: _protocolConfig
  }
}

export const useSpotPrice = () => {
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const spotPrices = usePairsInfo((state) => state.spotPrices)
  const spotPricesLoaded = usePairsInfo((state) => state.spotPricesLoaded)

  const spotPrice = useMemo(() => {
    if (spotPricesLoaded) return spotPrices[marginToken][quoteToken]
    return 0
  }, [spotPrices, marginToken, quoteToken, spotPricesLoaded])

  return {
    spotPrice,
    quoteToken,
    marginToken
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
