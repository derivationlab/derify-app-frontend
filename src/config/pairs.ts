import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import {
  getETHAddress,
  getBTCAddress,
  getDerifyDerivativeBTCAddress,
  getDerifyDerivativeETHAddress
  // getDerifyDerivativeBNBAddress,
  // getBNBAddress
} from '@/utils/addressHelpers'

const pairs = [
  {
    name: `BTC-${BASE_TOKEN_SYMBOL}`,
    token: getBTCAddress(),
    symbol: 'BTC',
    contract: getDerifyDerivativeBTCAddress()
  },
  {
    name: `ETH-${BASE_TOKEN_SYMBOL}`,
    token: getETHAddress(),
    symbol: 'ETH',
    contract: getDerifyDerivativeETHAddress()
  }
  // {
  //   name: `BNB-${BASE_TOKEN_SYMBOL}`,
  //   token: getBNBAddress(),
  //   symbol: 'BNB',
  //   contract: getDerifyDerivativeBNBAddress()
  // }
]

export default pairs
