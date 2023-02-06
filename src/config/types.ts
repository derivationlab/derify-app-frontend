export enum ChainId {
  MAINNET = 56,
  TESTNET = 97
}

export interface Address {
  97?: string
  56: string
}

export interface Token {
  name?: string
  symbol: string
  address: Address
  decimals: number
  projectLink?: string
}
