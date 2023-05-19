import { create } from 'zustand'
import { MarginIndicatorsState, Rec } from '@/store/types'

/**
 {
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": {
        "apy": "0.0000",
        "longPmrRate": "0",
        "shortPmrRate": "0",
        "price_change_rate": "-0.018762845460086795"
    },
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": {
        "apy": "0.0000",
        "longPmrRate": "0",
        "shortPmrRate": "0",
        "price_change_rate": "-0.005902860509401065"
    },
    "0xD5eC82071D0c870BfBa60B58A0AA52E42A3BEFba": {
        "apy": "0.0000",
        "longPmrRate": "0",
        "shortPmrRate": "0",
        "price_change_rate": 0
    },
    "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd": {
        "apy": "0.0000",
        "longPmrRate": "0",
        "shortPmrRate": "0",
        "price_change_rate": 0
    }
}
 */
const useMarginIndicatorsStore = create<MarginIndicatorsState>((set) => ({
  marginIndicators: null,
  marginIndicatorsLoaded: false,
  updateMarginIndicators: (data: Rec) =>
    set(() => {
      console.info('updateMarginIndicators:')
      console.info(data)

      return { marginIndicators: data, marginIndicatorsLoaded: true }
    })
}))

export { useMarginIndicatorsStore }
