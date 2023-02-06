import { ChainId } from '@/typings/index'

declare namespace GlobalType {
  type Chain = ChainId.MAINNET | ChainId.TESTNET
}

export = GlobalType
export as namespace GlobalType
