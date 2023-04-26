import type { Ethereum as _Ethereum } from '@wagmi/core'

import { ChainId } from '@/typings/index'

declare namespace GlobalType {
  type Chain = ChainId.MAINNET | ChainId.TESTNET
  type Ethereum = _Ethereum
}

export = GlobalType
export as namespace GlobalType
