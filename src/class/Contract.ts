import warning from 'tiny-warning'
import invariant from 'tiny-invariant'
import { getAddress } from '@ethersproject/address'

import { ChainIdRec } from '@/typings'
import { _getAddress } from '@/class/Token'

export function addressCheck(address: string) {
  try {
    const check = getAddress(address)

    warning(address === check, `Invalid checksum address: ${address}`)

    return check
  } catch (error) {
    invariant(false, `Invalid address: ${address}`)
  }
}

class Contract {
  readonly name: string
  readonly address: ChainIdRec

  constructor(name: string, address: ChainIdRec) {
    this.name = name
    this.address = this.checkAddress(address)
  }

  get contractAddress() {
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

export default Contract
