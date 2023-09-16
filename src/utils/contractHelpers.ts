import type { Contract } from '@ethersproject/contracts'
import type { ContractInterface } from '@ethersproject/contracts'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'

import { BEST_RPC_KEY, CHAIN_ID, DEFAULT_PRC_URLS } from '@/config'
import applyTokenAbi from '@/config/abi/DerifyApplyToken.json'
import DerifyBrokerRewardsAbi from '@/config/abi/DerifyBrokerRewards.json'
import consultantAbi from '@/config/abi/DerifyConsultant.json'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import factoryAbi from '@/config/abi/DerifyFactory.json'
import DerifyPmrAbi from '@/config/abi/DerifyPmr.json'
import derifyPoolAbi from '@/config/abi/DerifyPool.json'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import DerifyRankAbi from '@/config/abi/DerifyRank.json'
import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import tokenMintAbi from '@/config/abi/DerifyTokenMint.json'
import multiCallAbi from '@/config/abi/MM.json'
import priceFeedAbi from '@/config/abi/MarginTokenPriceFeed.json'
import bep20Abi from '@/config/abi/erc20.json'
import contracts from '@/config/contracts'
import { TSigner } from '@/typings'

export const getJsonRpcProvider = (): StaticJsonRpcProvider => {
  const local = localStorage.getItem(BEST_RPC_KEY)
  const rpc = local ? JSON.parse(local)?.state.rpc : DEFAULT_PRC_URLS[CHAIN_ID]
  // console.info(rpc)
  return new StaticJsonRpcProvider(rpc)
}

export const getContract = (abi: ContractInterface, address: string, signer?: TSigner): Contract => {
  const signerOrProvider = signer ?? getJsonRpcProvider()
  return new ethers.Contract(address, abi, signerOrProvider)
}

export const getBep20Contract = (address: string, signer?: TSigner) => {
  return getContract(bep20Abi, address, signer)
}

export const getMulticallContract = (signer?: TSigner) => {
  return getContract(multiCallAbi, contracts.multicall.contractAddress, signer)
}

export const getMiningContract = (address: string, signer?: TSigner) => {
  return getContract(DerifyPmrAbi, address, signer)
}

export const getRankingContract = (address: string, signer?: TSigner) => {
  return getContract(DerifyRankAbi, address, signer)
}

export const getRewardsContract = (address: string, signer?: TSigner) => {
  return getContract(DerifyRewardsAbi, address, signer)
}

export const getBrokerContract = (address: string, signer?: TSigner) => {
  return getContract(DerifyBrokerRewardsAbi, address, signer)
}

export const getExchangeContract = (address: string, signer?: TSigner) => {
  return getContract(DerifyExchangeAbi, address, signer)
}

export const getProtocolContract = (signer?: TSigner) => {
  return getContract(DerifyProtocolAbi, contracts.derifyProtocol.contractAddress, signer)
}

export const getDerivativeContract = (pairAddress: string, signer?: TSigner) => {
  return getContract(DerifyDerivativeAbi, pairAddress, signer)
}

export const getFactoryContract = (address: string, signer?: TSigner) => {
  return getContract(factoryAbi, address, signer)
}

export const getPriceFeedContract = (address: string, signer?: TSigner) => {
  return getContract(priceFeedAbi, address, signer)
}

export const getDerifyPoolContract = (signer?: TSigner) => {
  return getContract(derifyPoolAbi, contracts.derifyPool.contractAddress, signer)
}

export const getTokenMintContract = (address: string, signer?: TSigner) => {
  return getContract(tokenMintAbi, address, signer)
}

export const getConsultantContract = (signer?: TSigner) => {
  return getContract(consultantAbi, contracts.derifyConsultant.contractAddress, signer)
}

export const getApplyTokenContract = (signer?: TSigner) => {
  return getContract(applyTokenAbi, contracts.derifyApply.contractAddress, signer)
}
