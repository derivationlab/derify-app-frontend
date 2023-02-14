import { ethers } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type { Contract } from '@ethersproject/contracts'
import type { Signer } from '@ethersproject/abstract-signer'
import type { ContractInterface } from '@ethersproject/contracts'

import { baseProvider } from '@/utils/baseProvider'
import {
  getMultiCallAddress,
  getDerifyBrokerAddress,
  getDerifyRewardsAddress,
  getDerifyExchangeAddress,
  getDerifyProtocolAddress
} from '@/utils/addressHelpers'

import bep20Abi from '@/config/abi/erc20.json'
import multiCallAbi from '@/config/abi/MM.json'
import DerifyBrokerAbi from '@/config/abi/DerifyBroker.json'
import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import MarginTokenPriceFeedAbi from '@/config/abi/MarginTokenPriceFeed.json'

export const getContract = (abi: ContractInterface, address: string, signer?: Signer | Provider | null): Contract => {
  const signerOrProvider = signer ?? baseProvider
  return new ethers.Contract(address, abi, signerOrProvider)
}

export const getBep20Contract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(bep20Abi, address, signer)
}

export const getMulticallContract = (signer?: Signer | Provider | null) => {
  return getContract(multiCallAbi, getMultiCallAddress(), signer)
}

export const getDerifyRewardsContract = (signer?: Signer | Provider | null) => {
  return getContract(DerifyRewardsAbi, getDerifyRewardsAddress(), signer)
}

export const getDerifyBrokerContract = (signer?: Signer | Provider | null) => {
  return getContract(DerifyBrokerAbi, getDerifyBrokerAddress(), signer)
}

export const getDerifyExchangeContract = (signer?: Signer | Provider | null) => {
  return getContract(DerifyExchangeAbi, getDerifyExchangeAddress(), signer)
}

export const getDerifyExchangeContract1 = (address: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyExchangeAbi, address, signer)
}

export const getDerifyDerivativePairContract = (pairAddress: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyDerivativeAbi, pairAddress, signer)
}

export const getDerifyProtocolContract = (signer?: Signer | Provider | null) => {
  return getContract(DerifyProtocolAbi, getDerifyProtocolAddress(), signer)
}

export const getMarginTokenPriceFeedContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(MarginTokenPriceFeedAbi, address, signer)
}
