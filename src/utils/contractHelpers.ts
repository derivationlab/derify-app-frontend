import { ethers } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type { Contract } from '@ethersproject/contracts'
import type { Signer } from '@ethersproject/abstract-signer'
import type { ContractInterface } from '@ethersproject/contracts'

import contracts from '@/config/contracts'
import { baseProvider } from '@/utils/baseProvider'

import bep20Abi from '@/config/abi/erc20.json'
import multiCallAbi from '@/config/abi/MM.json'
import DerifyBrokerAbi from '@/config/abi/DerifyBroker.json'
import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

export const getContract = (abi: ContractInterface, address: string, signer?: Signer | Provider | null): Contract => {
  const signerOrProvider = signer ?? baseProvider
  return new ethers.Contract(address, abi, signerOrProvider)
}

export const getBep20Contract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(bep20Abi, address, signer)
}

export const getMulticallContract = (signer?: Signer | Provider | null) => {
  return getContract(multiCallAbi, contracts.multicall.contractAddress, signer)
}

export const getDerifyRewardsContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyRewardsAbi, address, signer)
}

export const getDerifyBrokerContract = (signer?: Signer | Provider | null) => {
  return getContract(DerifyBrokerAbi, contracts.derifyBroker.contractAddress, signer)
}

export const getDerifyExchangeContract = (address: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyExchangeAbi, address, signer)
}

export const getDerifyDerivativePairContract = (pairAddress: string, signer?: Signer | Provider | null) => {
  return getContract(DerifyDerivativeAbi, pairAddress, signer)
}

export const getDerifyProtocolContract = (signer?: Signer | Provider | null) => {
  return getContract(DerifyProtocolAbi, contracts.derifyProtocol.contractAddress, signer)
}
