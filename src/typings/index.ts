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

export type AllTokenKeys = 'drf' | 'edrf'

export type ContractKeys = 'multicall' | 'derifyProtocol'

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
  UPDATE_BALANCE = 'UPDATE_BALANCE',
  UPDATE_GRANT_LIST = 'UPDATE_GRANT_LIST',
  UPDATE_BROKER_DAT = 'UPDATE_BROKER_DAT',
  UPDATE_BUYBACK_VALUE = 'UPDATE_BUYBACK_VALUE',
  UPDATE_OPENED_POSITION = 'UPDATE_OPENED_POSITION',
  UPDATE_POSITION_VOLUME = 'UPDATE_POSITION_VOLUME',
  UPDATE_TRADER_VARIABLES = 'UPDATE_TRADER_VARIABLES',
  UPDATE_BROKER_BOUND_DAT = 'UPDATE_BROKER_BOUND_DAT'
}

export type GrantKeys = 'rank' | 'mining' | 'awards'
