import { isEmpty } from 'lodash'
import { nonBigNumberInterception, safeInterceptionValues } from '@/utils/tools'
import { getDerifyBrokerContract, getDerifyExchangeContract, getDerifyRewardsContract } from '@/utils/contractHelpers'
import {
  getBrokerInfoByAddr,
  getBrokerInfoByTrader,
  getBrokerRewardsToday,
  getBrokerValidPeriod,
  getTraderBondBalance,
  getTraderEDRFBalance
} from '@/api'

const exchangeContract = getDerifyExchangeContract()
const rewardsContract = getDerifyRewardsContract()
const brokerContract = getDerifyBrokerContract()

const getBrokerValidPeriodData = async (trader: string): Promise<number> => {
  try {
    const { data } = await getBrokerValidPeriod(trader)
    return Number(data)
  } catch (e) {
    return 0
  }
}

const getBrokerInfoByContract = async (trader: string) => {
  const base = {
    validPeriodDays: 0,
    usdRewardBalance: '0',
    drfRewardBalance: '0',
    accumulatedDrfReward: '0',
    accumulatedUsdReward: '0',
    isBroker: false
  }

  try {
    const broker = await brokerContract.getBrokerInfo(trader)
    const period = await getBrokerValidPeriodData(trader)

    const { usdRewardBalance, drfRewardBalance, accumulatedDrfReward, accumulatedUsdReward } = broker

    return {
      isBroker: true,
      validPeriodDays: period,
      usdRewardBalance: safeInterceptionValues(usdRewardBalance),
      drfRewardBalance: safeInterceptionValues(drfRewardBalance),
      accumulatedDrfReward: safeInterceptionValues(accumulatedDrfReward),
      accumulatedUsdReward: safeInterceptionValues(accumulatedUsdReward)
    }
  } catch (e) {
    // DBroker: GBI_NOT_BROKER
    console.info(e)
    return base
  }
}

export const getTraderAccountData = async (trader: string): Promise<Record<string, string>> => {
  const defaultVal = {
    balance: '0',
    marginBalance: '0',
    totalMargin: '0',
    availableMargin: '0'
  }

  try {
    const { balance, marginBalance, totalMargin, availableMargin } = await exchangeContract.getTraderAccount(trader)
    return {
      balance: safeInterceptionValues(balance),
      marginBalance: safeInterceptionValues(marginBalance),
      totalMargin: safeInterceptionValues(totalMargin),
      availableMargin: safeInterceptionValues(availableMargin)
    }
  } catch (e) {
    // console.info(e)
    return defaultVal
  }
}

export const getTraderVariablesData = async (trader: string): Promise<Record<string, string>> => {
  const defaultVal = {
    marginBalance: '0',
    marginRate: '0',
    totalPositionAmount: '0'
  }

  try {
    const { marginBalance, marginRate, totalPositionAmount } = await exchangeContract.getTraderVariables(trader)
    return {
      marginBalance: safeInterceptionValues(marginBalance),
      marginRate: safeInterceptionValues(marginRate, 4),
      totalPositionAmount: safeInterceptionValues(totalPositionAmount)
    }
  } catch (e) {
    // console.info(e)
    return defaultVal
  }
}

export const getTraderAsBrokerData = async (trader: string): Promise<Record<string, any>> => {
  try {
    const { data } = await getBrokerInfoByAddr(trader)
    const { data: today } = await getBrokerRewardsToday(trader)
    const fromContract = await getBrokerInfoByContract(trader)
    // console.info(today)
    if (!isEmpty(data)) {
      const { id, ...rest } = data

      const reference = `${window.location.origin}/broker/${id}`

      return {
        id,
        reference,
        ...today,
        ...rest,
        ...fromContract
      }
    }

    return { ...fromContract, ...today }
  } catch (e) {
    return {}
  }
}

export const getTraderBoundBrokerData = async (trader: string): Promise<Record<string, any>> => {
  try {
    const { data } = await getBrokerInfoByTrader(trader)
    if (!isEmpty(data)) return data
    return {}
  } catch (e) {
    return {}
  }
}

export const getPMRewardData = async (trader: string) => {
  const base = { usdBalance: '0', pmrAccumulatedBalance: '0' }

  try {
    const data = await rewardsContract.getPositionReward(trader)

    const { usdBalance, usdAccumulatedBalance, drfBalance, drfAccumulatedBalance } = data

    return {
      usdBalance: safeInterceptionValues(usdBalance),
      usdAccumulatedBalance: safeInterceptionValues(usdAccumulatedBalance),
      drfBalance: safeInterceptionValues(drfBalance),
      drfAccumulatedBalance: safeInterceptionValues(drfAccumulatedBalance)
    }
  } catch (e) {
    console.info(e)
    return base
  }
}

const getTraderBondBalanceData = async (trader: string): Promise<number> => {
  try {
    const { data } = await getTraderBondBalance(trader)
    return data
  } catch (e) {
    return 0
  }
}

export const getBondInfoData = async (trader: string) => {
  const base = {
    bondBalance: '0',
    exchangeable: '0',
    bondReturnBalance: '0',
    bondWalletBalance: '0',
    bondAnnualInterestRatio: '0'
  }

  try {
    const bondInfo = await rewardsContract.getBondInfo(trader)
    const bondBalance = await getTraderBondBalanceData(trader)
    const exchangeable = await rewardsContract.getExchangeBondSizeUpperBound(trader)

    const _bondBalance = nonBigNumberInterception(bondBalance)
    const { bondReturnBalance, bondWalletBalance, bondAnnualInterestRatio } = bondInfo

    return {
      bondBalance: _bondBalance,
      exchangeable: safeInterceptionValues(exchangeable),
      bondWalletBalance: safeInterceptionValues(bondWalletBalance),
      bondReturnBalance: safeInterceptionValues(bondReturnBalance),
      bondAnnualInterestRatio: safeInterceptionValues(bondAnnualInterestRatio)
    }
  } catch (e) {
    // console.info(e)
    return base
  }
}

const getTraderEDRFBalanceData = async (trader: string): Promise<number> => {
  try {
    const { data } = await getTraderEDRFBalance(trader)
    return data
  } catch (e) {
    return 0
  }
}

export const getStakingInfoData = async (trader: string) => {
  const base = { stakingDRFBalance: '0', stakingEDRFBalance: '0' }

  try {
    const eDRFBalance = await getTraderEDRFBalanceData(trader)
    const stakingInfo = await rewardsContract.getStakingInfo(trader)

    const { drfBalance } = stakingInfo
    const stakingEDRFBalance = nonBigNumberInterception(eDRFBalance)

    return {
      stakingDRFBalance: safeInterceptionValues(drfBalance),
      stakingEDRFBalance
    }
  } catch (e) {
    // console.info(e)
    return base
  }
}
