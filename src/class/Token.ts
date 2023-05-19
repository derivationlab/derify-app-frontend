import { getAddress } from '@ethersproject/address'
import invariant from 'tiny-invariant'
import warning from 'tiny-warning'

import { ChainId, ChainIdRec } from '@/typings'

export const _getAddress = (address: ChainIdRec): string => {
  const chainId = process.env.REACT_APP_CHAIN_ID ?? ChainId.MAINNET
  return address[chainId].toLowerCase()
}

export function addressCheck(address: string, key?: string) {
  try {
    if (!address) {
      warning(false, `${key} ▶ contract address not set`)
      return ''
    }

    const check = getAddress(address)

    warning(address === check, `${key} ▶ valid checksum address: ${address}`)

    return check
  } catch (error) {
    invariant(false, `${key} ▶ invalid address: ${address}`)
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
    return `market/${this.symbol.toLowerCase()}.svg`
  }

  get tokenAddress() {
    return _getAddress(this.address)
  }

  checkAddress<T>(address: T): T {
    let obj = Object.create(null)
    for (const key in address) {
      const check = addressCheck(String(address[key]), `${this.name}-${key}`)
      obj = { ...obj, [key]: check }
    }
    return obj as T
  }
}

export default Token
