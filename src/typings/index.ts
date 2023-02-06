import GlobalType from '@/typings/global'

export enum ChainId {
  MAINNET = 56,
  TESTNET = 97
}

export type ChainIdRec = { [key in GlobalType.Chain]: string }

export type TokenKeys = 'btc' | 'busd' | 'bbusd' | 'eth' | 'drf' | 'matic' | 'bnb' | 'edrf'

export enum PriceType {
  Market,
  Limit
}

export enum PubSubEvents {
  kline = 'kline',
  ticker = '24hrTicker'
}