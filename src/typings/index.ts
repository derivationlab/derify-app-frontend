import GlobalType from '@/typings/global'
import { contractInfo } from '@/store/config/helper'

export enum ChainId {
  MAINNET = 56,
  TESTNET = 97
}

export type ChainIdRec = { [key in GlobalType.Chain]: string }

export type QuoteTokenKeys = 'BTC' | 'ETH'

export type MarginTokenKeys = 'DRF' | 'BUSD'

export type AllTokenKeys = 'btc' | 'busd' | 'bbusd' | 'eth' | 'drf' | 'matic' | 'bnb' | 'edrf'

export type MarginToken = { [key in MarginTokenKeys]: any }

export type MarginTokenWithQuote = { [key in MarginTokenKeys]: { [key in QuoteTokenKeys]: any } }

export type MarginTokenWithContract = { [key in MarginTokenKeys]: typeof contractInfo }

export enum PriceType {
  Market,
  Limit
}

export enum PubSubEvents {
  kline = 'kline',
  ticker = '24hrTicker'
}
