import { ChainIdRec } from '@/typings'
import { _getAddress, addressCheck } from '@/class/Token'

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
      const check = addressCheck(String(address[key]), `${this.name}-${key}`)
      obj = { ...obj, [key]: check }
    }
    return obj as T
  }
}

export default Contract
