import tokens from '@/config/tokens'
import contracts from '@/config/contracts'
import { Address, ChainId } from '@/config/types'

export const getAddress = (address: Address): string => {
  const chainId = process.env.REACT_APP_CHAIN_ID ?? '56'
  return address[chainId] ? (address[chainId] ?? '').toLowerCase() : address[ChainId.MAINNET].toLowerCase()
}

export const getSymbol = (address: string): string => {
  const find = Object.values(tokens).find((token) => getAddress(token.address) === address.toLowerCase())
  return find?.symbol ?? ''
}

export const getMulticallAddress = () => {
  return getAddress(contracts.multiCall)
}

/************** Contracts **************/
export const getDerifyRewardsAddress = (): string => {
  return getAddress(contracts.DerifyRewards)
}

export const getDerifyExchangeAddress = () => {
  return getAddress(contracts.DerifyExchange)
}

export const getDerifyDerivativeBTCAddress = () => {
  return getAddress(contracts.DerifyDerivative_BTC)
}

export const getDerifyDerivativeETHAddress = () => {
  return getAddress(contracts.DerifyDerivative_ETH)
}

export const getDerifyBrokerAddress = () => {
  return getAddress(contracts.DerifyBroker)
}

/************** Tokens **************/
export const getEDRFAddress = () => {
  return getAddress(tokens.eDRF.address)
}

export const getBDRFAddress = () => {
  return getAddress(tokens.bDRF.address)
}

export const getDRFAddress = () => {
  return getAddress(tokens.DRF.address)
}

export const getBUSDAddress = () => {
  return getAddress(tokens.BUSD.address)
}

export const getETHAddress = () => {
  return getAddress(tokens.ETH.address)
}

export const getBTCAddress = () => {
  return getAddress(tokens.BTC.address)
}
