import GlobalType from '@/typings/global'
import { contractInfo } from '@/hooks/useProtocolConfig'

export enum ChainId {
  MAINNET = 56,
  TESTNET = 97
}

export type ChainIdRec = { [key in GlobalType.Chain]: string }

export type QuoteTokenKeys = 'BTC' | 'ETH'

export type MarginTokenKeys = 'DRF' | 'BUSD'

export type AllTokenKeys = 'btc' | 'busd' | 'eth' | 'drf' | 'matic' | 'bnb' | 'edrf'

export type ContractKeys = 'multicall' | 'derifyProtocol'

export type MarginToken = { [key in MarginTokenKeys]: any }

export type MarginTokenWithQuote = { [key in MarginTokenKeys]: { [key in QuoteTokenKeys]: any } }

export type MarginTokenWithContract = { [key in MarginTokenKeys]: typeof contractInfo }

export enum PriceType {
  Market,
  Limit
}

export enum PositionSide {
  long,
  short,
  twoWay
}

export enum OrderTypes {
  Limit,
  StopProfit,
  StopLoss
}

export enum PubSubEvents {
  UPDATE_BALANCE = 'UPDATE_BALANCE',
  UPDATE_BROKER_DAT = 'UPDATE_BROKER_DAT',
  UPDATE_TRADE_HISTORY = 'UPDATE_TRADE_HISTORY',
  UPDATE_OPENED_POSITION = 'UPDATE_OPENED_POSITION',
  UPDATE_POSITION_AMOUNT = 'UPDATE_POSITION_AMOUNT'
}
