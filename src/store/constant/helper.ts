import { isEmpty, times } from 'lodash'
import { BigNumberish, BigNumber } from '@ethersproject/bignumber'

import basePairs from '@/config/pairs'
import { getCurrentPositionsAmount } from '@/api'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { multicall } from '@/utils/multicall'
import { safeInterceptionValues } from '@/utils/tools'
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
  let combine = {}
  basePairs.forEach((pair) => {
    combine = { ...combine, [pair.token]: '0' }
  })
  let feeRatios = combine
  const contracts = basePairs.map((pair) => pair.contract)

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
