import create from 'zustand'

import { BrokerInfoState } from '@/store/types'
import {
  getBrokerInfoByAddr,
  getBrokerInfoByTrader,
  getBrokerRankValue,
  getBrokerRegisterTime,
  getBrokerRewardsToday,
  getBrokerValidPeriod
} from '@/api'

const useBrokerInfo = create<BrokerInfoState>((set) => ({
  brokerInfo: {},
  brokerBound: {},
  brokerInfoLoaded: false,
  brokerBoundLoaded: false,
  fetchBrokerBound: async (trader: string) => {
    const data = await getBrokerInfoByTrader(trader)

    // console.info(`fetchBrokerBound`)
    // console.info(data?.data)

    set({ brokerBound: data?.data, brokerBoundLoaded: true })
  },
  fetchBrokerInfo: async (trader: string, marginToken: string) => {
    const data0 = await getBrokerRankValue(trader, marginToken)
    const data1 = await getBrokerInfoByAddr(trader)
    const data2 = await getBrokerValidPeriod(trader) // validPeriodDays
    const data3 = await getBrokerRewardsToday(trader, marginToken)
    const data4 = await getBrokerRegisterTime(trader)
    console.info(data2?.data)

    set({
      brokerInfo: data1?.data
        ? {
            ...data1?.data,
            ...data3?.data,
            rank: data0?.data,
            registerTime: data4?.data,
            validPeriodDays: data2?.data ?? 0
          }
        : {},
      brokerInfoLoaded: true
    })
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
