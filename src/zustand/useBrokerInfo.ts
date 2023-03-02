import create from 'zustand'

import { BrokerInfoState, Rec } from '@/zustand/types'
import {
  getBrokerInfoByAddr,
  getBrokerInfoByTrader,
  getBrokerRegisterTime,
  getBrokerRewardsToday,
  getBrokerValidPeriod
} from '@/api'

const useBrokerInfo = create<BrokerInfoState>((set) => ({
  brokerInfo: {},
  brokerAssets: {},
  brokerInfoLoaded: false,
  fetchBrokerInfoByAddr: async (trader: string) => {
    const data1 = await getBrokerInfoByAddr(trader)
    const data2 = await getBrokerValidPeriod(trader) // validPeriodDays
    const data3 = await getBrokerRewardsToday(trader)
    const data4 = await getBrokerRegisterTime(trader)
    const data5 = await getBrokerInfoByTrader(trader)

    console.info(`fetchBrokerInfoByAddr`)
    console.info(data1)
    console.info(data2)

    // set({ rpc: node })
  },
  updateBrokerAssets: (data: Rec) =>
    set(() => {
      console.info('updateBrokerAssets:')
      console.info(data)
      return { brokerAssets: data }
    }),
}))

export { useBrokerInfo }
