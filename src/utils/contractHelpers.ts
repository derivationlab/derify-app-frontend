import { ethers } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type { Contract } from '@ethersproject/contracts'
import type { Signer } from '@ethersproject/abstract-signer'
import type { ContractInterface } from '@ethersproject/contracts'
import { baseProvider } from '@/utils/baseProvider'

import bep20Abi from '@/config/abi/erc20.json'
import multiCallAbi from '@/config/abi/MM.json'
import eDRFAbi from '@/config/abi/eDRF.json'
import bBUSDAbi from '@/config/abi/bBUSD.json'
import DUSDAbi from '@/config/abi/DUSD.json'
import DerifyBrokerAbi from '@/config/abi/DerifyBroker.json'
import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import {
  getbBUSDAddress,
  getDUSDAddress,
  getDerifyBrokerAddress,
  getDerifyDerivativeBTCAddress,
  getDerifyDerivativeETHAddress,
  getDerifyExchangeAddress,
  getDerifyRewardsAddress,
  getEDRFAddress,
  getMultiCallAddress
} from '@/utils/addressHelpers'

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

export const getEDRFContract = (signer?: Signer | Provider | null) => {
  return getContract(eDRFAbi, getEDRFAddress(), signer)
}

export const getBDRFContract = (signer?: Signer | Provider | null) => {
  return getContract(bBUSDAbi, getbBUSDAddress(), signer)
}

export const getBUSDContract = (signer?: Signer | Provider | null) => {
  return getContract(DUSDAbi, getDUSDAddress(), signer)
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

export const getDerifyDerivativeETHContract = (signer?: Signer | Provider | null) => {
  return getContract(DerifyDerivativeAbi, getDerifyDerivativeETHAddress(), signer)
}

export const getDerifyDerivativeBTCContract = (signer?: Signer | Provider | null) => {
  return getContract(DerifyDerivativeAbi, getDerifyDerivativeBTCAddress(), signer)
}
