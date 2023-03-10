import warning from 'tiny-warning'
import invariant from 'tiny-invariant'
import { getAddress } from '@ethersproject/address'

import { ChainId, ChainIdRec } from '@/typings'

export const _getAddress = (address: ChainIdRec): string => {
  const chainId = process.env.REACT_APP_CHAIN_ID ?? ChainId.MAINNET
  return address[chainId].toLowerCase()
}

export function addressCheck(address: string) {
  try {
    const check = getAddress(address)

    warning(address === check, `Invalid checksum address: ${address}`)

    return check
  } catch (error) {
    invariant(false, `Invalid address: ${address}`)
  }
}

class Token {
  readonly name: string
  readonly symbol: string
  readonly address: ChainIdRec
  readonly precision?: number
  readonly decimals?: number
  readonly projectLink?: string

  constructor(name: string, symbol: string, address: ChainIdRec, precision = 18, decimals = 8, projectLink = '') {
    this.name = name
    this.symbol = symbol
    this.address = this.checkAddress(address)
    this.decimals = decimals
    this.precision = precision
    this.projectLink = projectLink
  }

  get icon() {
    return `symbol/${this.symbol.toLowerCase()}.svg`
  }

  get tokenAddress() {
    return _getAddress(this.address)
  }

  checkAddress<T>(address: T): T {
    let obj = Object.create(null)
    for (const key in address) {
      const check = addressCheck(String(address[key]))
      obj = { ...obj, [key]: check }
    }
    return obj as T
  }
}

export default Token
