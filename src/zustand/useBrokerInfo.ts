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
  brokerBound: {},
  brokerAssets: {},
  brokerInfoLoaded: false,
  brokerBoundLoaded: false,
  brokerAssetsLoaded: false,
  fetchBrokerBound: async (trader: string) => {
    const data = await getBrokerInfoByTrader(trader)

    // console.info(`fetchBrokerBound`)
    console.info(data?.data)

    set({ brokerBound: data?.data, brokerBoundLoaded: true })
  },
  fetchBrokerInfo: async (trader: string) => {
    const data1 = await getBrokerInfoByAddr(trader)
    const data2 = await getBrokerValidPeriod(trader) // validPeriodDays
    const data3 = await getBrokerRewardsToday(trader)
    const data4 = await getBrokerRegisterTime(trader)
    /**
     * getBrokerRewardsToday()
     * margin_token: margin token地址
     * margin_token_reward: 今日margin token收益
     * drf_reward: 今日DRF收益
     * margin_token_reward_rate: 今日margin token收益占比
     * txs_num: 日交易笔数
     * traders_num: 日活用户数
     */
    // console.info(`fetchBrokerInfo`)
    // console.info(data1.data)
    // console.info(data2.data)
    // console.info(data3.data)
    // console.info(data4.data)

    set({
      brokerInfo: data1.data
        ? {
            ...data1?.data,
            ...data3?.data,
            registerTime: data4?.data,
            validPeriodDays: data2?.data
          }
        : {},
      brokerInfoLoaded: true
    })
  },
  updateBrokerAssets: (data: Rec) =>
    set(() => {
      // console.info('updateBrokerAssets:')
      // console.info(data)
      return { brokerAssets: data, brokerAssetsLoaded: true }
    })
}))

export { useBrokerInfo }
