import create from 'zustand'

import { BrokerInfoState } from '@/store/types'
import { getDerifyProtocolContract } from '@/utils/contractHelpers'
import {
  getBrokerRankValue,
  getBrokerInfoByAddr,
  getBrokerValidPeriod,
  getBrokerRegisterTime,
  getBrokerRewardsToday,
  getBrokerInfoByTrader
} from '@/api'

const getBrokerInfo = async (trader: string): Promise<boolean> => {
  const c = getDerifyProtocolContract()

  try {
    await c.getBrokerInfo(trader)
    return true
  } catch (e) {
    return false
  }
}

const useBrokerInfo = create<BrokerInfoState>((set) => ({
  brokerInfo: {},
  brokerBound: {},
  isBrokerLoaded: false,
  brokerInfoLoaded: false,
  brokerBoundLoaded: false,
  fetchBrokerBound: async (trader: string) => {
    const data = await getBrokerInfoByTrader(trader)

    // console.info(`fetchBrokerBound`)
    // console.info(data?.data)

    set({ brokerBound: data?.data, brokerBoundLoaded: true })
  },
  fetchBrokerInfo: async (trader: string, marginToken: string) => {
    const data = await getBrokerInfo(trader)

    if (data) {
      const { data: rank = 0 } = await getBrokerRankValue(trader, marginToken)
      const { data: time = 0 } = await getBrokerRegisterTime(trader)
      const { data: period = 0 } = await getBrokerValidPeriod(trader)
      const { data: info = {} } = await getBrokerInfoByAddr(trader)
      const { data: rewards = {} } = await getBrokerRewardsToday(trader, marginToken)
      // console.info(info)
      set({
        brokerInfo: {
          rank,
          ...info,
          ...rewards,
          registerTime: time,
          validPeriodDays: period
        },
        brokerInfoLoaded: true
      })
    } else {
      set({
        brokerInfoLoaded: true
      })
    }
  },
  resetBrokerInfo: () => {
    set({
      brokerInfo: {},
      brokerInfoLoaded: false
    })
  },
  resetBrokerBound: () => {
    set({
      brokerBound: {},
      brokerBoundLoaded: false
    })
  }
}))

export { useBrokerInfo }
