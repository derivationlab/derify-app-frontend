import type { Ethereum as _Ethereum } from '@wagmi/core'

declare namespace GlobalType {
  type Ethereum = _Ethereum
}

export = GlobalType
export as namespace GlobalType
