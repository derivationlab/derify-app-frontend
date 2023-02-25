import { isEmpty } from 'lodash'
import { nonBigNumberInterception, safeInterceptionValues } from '@/utils/tools'
import {
  getDerifyBrokerContract,
  getDerifyExchangeContract,
  getDerifyExchangeContract1,
  getDerifyRewardsContract
} from '@/utils/contractHelpers'
import {
  getBrokerInfoByAddr,
  getBrokerValidPeriod,
  getTraderBondBalance,
  getTraderEDRFBalance,
  getBrokerRewardsToday,
  getBrokerInfoByTrader,
  getBrokerRegisterTime
} from '@/api'

const exchangeContract = getDerifyExchangeContract()
const rewardsContract = getDerifyRewardsContract()
const brokerContract = getDerifyBrokerContract()

export const getBrokerValidPeriodData = async (trader: string): Promise<number> => {
  const { data = 0 } = await getBrokerValidPeriod(trader) // DBroker: GBI_NOT_BROKER
  return Number(data)
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

export const getTraderAccountData = async (trader: string, address: string): Promise<Record<string, string>> => {
  const exchangeContract = getDerifyExchangeContract1(address)
  const defaultVal = {
    balance: '0',
    marginBalance: '0',
    totalMargin: '0',
    availableMargin: '0'
  }

  try {
    const { balance, marginBalance, totalMargin, availableMargin } = await exchangeContract.getTraderAccount(trader)
    // console.info(`getTraderAccount-marginBalance: ${safeInterceptionValues(marginBalance)}`)
    return {
      balance: safeInterceptionValues(balance),
      marginBalance: safeInterceptionValues(marginBalance),
      totalMargin: safeInterceptionValues(totalMargin),
      availableMargin: safeInterceptionValues(availableMargin, 8)
    }
  } catch (e) {
    console.info(e)
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
    // console.info(`getTraderVariables-marginBalance: ${safeInterceptionValues(marginBalance)}`)
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
    const { data: registerTime } = await getBrokerRegisterTime(trader)
    const fromContract = await getBrokerInfoByContract(trader)
    // console.info(registerTime)
    if (!isEmpty(data)) {
      const { id, ...rest } = data

      const reference = `${window.location.origin}/broker/${id}`

      return {
        id,
        reference,
        ...today,
        ...rest,
        ...fromContract,
        update_time: registerTime
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
      usdBalance: safeInterceptionValues(usdBalance, 4),
      usdAccumulatedBalance: safeInterceptionValues(usdAccumulatedBalance),
      drfBalance: safeInterceptionValues(drfBalance, 4),
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

    // ************
    const bondBalance = await getTraderBondBalanceData(trader) // '0x12f756f0FD6E3C13A51223b1B0040fE914680908'

    const exchangeable = await rewardsContract.getExchangeBondSizeUpperBound(trader)
    // console.info(bondBalance)
    const _bondBalance = nonBigNumberInterception(bondBalance.toFixed(8), 4) // todo
    const { bondReturnBalance, bondWalletBalance, bondAnnualInterestRatio } = bondInfo

    return {
      bondBalance: _bondBalance,
      exchangeable: safeInterceptionValues(exchangeable),
      bondWalletBalance: safeInterceptionValues(bondWalletBalance),
      bondReturnBalance: safeInterceptionValues(bondReturnBalance, 8),
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
    // **************
    const eDRFBalance = await getTraderEDRFBalanceData(trader)

    const stakingInfo = await rewardsContract.getStakingInfo(trader)

    const { drfBalance } = stakingInfo
    const stakingEDRFBalance = nonBigNumberInterception(eDRFBalance, 4)

    return {
      stakingDRFBalance: safeInterceptionValues(drfBalance, 8),
      stakingEDRFBalance
    }
  } catch (e) {
    // console.info(e)
    return base
  }
}
