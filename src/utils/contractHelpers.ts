import type { Signer } from '@ethersproject/abstract-signer'
import type { Contract } from '@ethersproject/contracts'
import type { ContractInterface } from '@ethersproject/contracts'
import type { Provider } from '@ethersproject/providers'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'

import { CHAIN_ID, DEFAULT_PRC_URLS } from '@/config'
import DerifyBrokerRewardsAbi from '@/config/abi/DerifyBrokerRewards.json'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import factoryAbi from '@/config/abi/DerifyFactory.json'
import DerifyPmrAbi from '@/config/abi/DerifyPmr.json'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import DerifyRankAbi from '@/config/abi/DerifyRank.json'
import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import multiCallAbi from '@/config/abi/MM.json'
import priceFeedAbi from '@/config/abi/MarginTokenPriceFeed.json'
import bep20Abi from '@/config/abi/erc20.json'
import contracts from '@/config/contracts'

export const getJsonRpcProvider = (): StaticJsonRpcProvider => {
  const local = localStorage.getItem('best-rpc')
  const rpc = local ? JSON.parse(local)?.state.rpc : DEFAULT_PRC_URLS[CHAIN_ID]
  // console.info(rpc)
  return new StaticJsonRpcProvider(rpc)
}

export const getContract = (abi: ContractInterface, address: string, signer?: Signer | Provider | null): Contract => {
  const signerOrProvider = signer ?? getJsonRpcProvider()
  return new ethers.Contract(address, abi, signerOrProvider)
}

export const getBep20Contract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(bep20Abi, address, signer)
}

export const getMulticallContract = (signer?: Signer | Provider | null) => {
  return getContract(multiCallAbi, contracts.multicall.contractAddress, signer)
}

export const getDerifyPmrContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyPmrAbi, address, signer)
}

export const getDerifyRankContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyRankAbi, address, signer)
}

export const getDerifyRewardsContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyRewardsAbi, address, signer)
}

export const getDerifyBRewardsContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyBrokerRewardsAbi, address, signer)
}

export const getDerifyExchangeContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyExchangeAbi, address, signer)
}

export const getDerifyProtocolContract = (signer?: Signer | Provider | null) => {
  return getContract(DerifyProtocolAbi, contracts.derifyProtocol.contractAddress, signer)
}

export const getDerifyDerivativeContract = (pairAddress: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyDerivativeAbi, pairAddress, signer)
}

export const getFactoryContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(factoryAbi, address, signer)
}

export const getPriceFeedContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(priceFeedAbi, address, signer)
}
