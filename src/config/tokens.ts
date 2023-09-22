import { memoize } from 'lodash-es'

import Token from '@/class/Token'
import { ChainId, TokenKeys } from '@/typings'

export const tokens: { [key in TokenKeys]: Token } = {
  drf: new Token(
    'Derify Protocol',
    'DRF',
    {
      [ChainId.MAINNET]: '0x89C1Af791d7B4cf046Dca8Fa10a41Dd2298A6a3F',
      [ChainId.TESTNET]: '0x63722c48A1e24301FF8A20D4c973f40BCFCfeCE8'
    },
    18,
    2
  ),
  usdt: new Token(
    'Tether',
    'USDT',
    {
      [ChainId.MAINNET]: '0x55d398326f99059fF775485246999027B3197955',
      [ChainId.TESTNET]: '0x838506F265c56Ed6a3Ec215e5AC2B67Ba681FA58'
    },
    18,
    2
  ),
  edrf: new Token(
    'eDRF',
    'eDRF',
    {
      [ChainId.MAINNET]: '0x9d1b272B797137d3713f0bA2fA15abcc3a8C2Ef7',
      [ChainId.TESTNET]: '0xcFC597eEDFC368c19AFD22e581468a2e69eA5E24'
    },
    18,
    2
  )
}

export const VALUATION_TOKEN_SYMBOL = 'USD'

export const PLATFORM_TOKEN = tokens.drf

export default tokens

export const findToken = memoize((key: string): Token => {
  // eslint-disable-next-line
  const upper = String(key).toUpperCase()
  return Object.values(tokens).find((t) => t.symbol.toUpperCase() === upper || t.tokenAddress.toUpperCase() === upper)!
})
