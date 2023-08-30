import { Signer } from 'ethers'

import GlobalType from '@/typings/global'

export type Rec = Record<string, any>

export enum ChainId {
  MAINNET = 56,
  TESTNET = 97
}

export enum ConnectorIds {
  MetaMask = 'metaMask',
  Injected = 'injected',
  WalletLink = 'coinbaseWallet',
  WalletConnect = 'walletConnectLegacy'
}

export type TSigner = Signer | null | undefined

export type ChainIdRec = { [key in GlobalType.Chain]: string }

export type TokenKeys = 'drf' | 'edrf'

export type ContractKeys = 'multicall' | 'derifyProtocol' | 'derifyPool'

export const protocolConfig = {
  rank: '',
  awards: '',
  mining: '',
  factory: '',
  rewards: '',
  exchange: '',
  clearing: '',
  priceFeed: '',
  bMarginToken: ''
}

export type ProtocolConfig = typeof protocolConfig

export enum PositionSideTypes {
  long,
  short,
  twoWay
}

export enum PositionOrderTypes {
  Market,
  Limit
}

export enum PositionTriggerTypes {
  Limit,
  StopProfit,
  StopLoss
}

export enum PubSubEvents {
  CONNECT_WALLET = 'CONNECT_WALLET',
  UPDATE_BALANCE = 'UPDATE_BALANCE',
  UPDATE_GRANT_LIST = 'UPDATE_GRANT_LIST',
  UPDATE_OPENED_POSITION = 'UPDATE_OPENED_POSITION',
  UPDATE_POSITION_VOLUME = 'UPDATE_POSITION_VOLUME'
}

export type GrantKeys = 'rank' | 'mining' | 'awards'

export const dataRecordInit = {
  records: [],
  pageIndex: 0,
  totalItems: 0,
  totalPages: 0,
  currentPage: 0,
  loaded: true
}
