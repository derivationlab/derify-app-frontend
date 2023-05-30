import Token from '@/class/Token'
import { ChainId, AllTokenKeys } from '@/typings'

export const tokens: { [key in AllTokenKeys]: Token } = {
  drf: new Token(
    'Derify Protocol',
    'DRF',
    {
      [ChainId.MAINNET]: '0x89C1Af791d7B4cf046Dca8Fa10a41Dd2298A6a3F',
      [ChainId.TESTNET]: '0x11B876d9D5d18d70664153C84fD3084c1E71E2ef'
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
