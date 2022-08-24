import { isEmpty, times } from 'lodash'
import { BigNumberish, BigNumber } from '@ethersproject/bignumber'

import { getCurrentPositionsAmount } from '@/api'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { basePairs } from '@/store/contract/helper'

import { multicall } from '@/utils/multicall'
import { safeInterceptionValues } from '@/utils/tools'

import {
  getETHAddress,
  getBTCAddress,
  getDerifyDerivativeBTCAddress,
  getDerifyDerivativeETHAddress
} from '@/utils/addressHelpers'
import { getDerifyRewardsContract } from '@/utils/contractHelpers'

export const getCurrentPositionsAmountData = async (token: string): Promise<Record<string, any>> => {
  const base = { long_position_amount: '0', short_position_amount: '0' }
  try {
    const { data } = await getCurrentPositionsAmount(token)
    if (data) return data
    return base
  } catch (e) {
    return base
  }
}

export const getPositionChangeFeeRatioData = async () => {
  const contracts = [getDerifyDerivativeBTCAddress(), getDerifyDerivativeETHAddress()]
  let feeRatios = {
    [getBTCAddress()]: '0',
    [getETHAddress()]: '0'
  }

  const calls = times(contracts.length, (index) => ({
    address: basePairs[index].contract,
    name: 'getPositionChangeFeeRatio'
  }))

  try {
    const feeRatioKeys = Object.keys(feeRatios)

    const response = await multicall(DerifyDerivativeAbi, calls)

    if (!isEmpty(response)) {
      response.forEach(([b]: [BigNumberish], index: number) => {
        const _ = BigNumber.from(b).mul(100)
        feeRatios = { ...feeRatios, [feeRatioKeys[index]]: safeInterceptionValues(_, 4) }
      })
      // console.info(feeRatios)
      return feeRatios
    }
    return feeRatios
  } catch (e) {
    console.info(e)
    return feeRatios
  }
}

export const getStakingDrfPoolData = async () => {
  const contract = getDerifyRewardsContract()
  const data = await contract.stakingDrfPool()
  return safeInterceptionValues(data._hex)
}

export const getBankBDRFPoolData = async () => {
  const contract = getDerifyRewardsContract()
  const data = await contract.bankBondPool()
  return safeInterceptionValues(data._hex)
}
