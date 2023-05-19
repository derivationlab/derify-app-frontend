import { create } from 'zustand'
import { BrokerInfoState } from '@/store/types'
import { getDerifyProtocolContract } from '@/utils/contractHelpers'
import {
  getBrokerBound,
  getBrokerRanking,
  getBrokerRewardsToday,
  getBrokerValidityPeriod,
  getBrokerInfoWithAddress,
  getBrokerRegistrationTime
} from '@/api'

const isIdentityValid = async (trader: string): Promise<boolean> => {
  const c = getDerifyProtocolContract()

  try {
    await c.getBrokerInfo(trader)
    return true
  } catch (e) {
    return false
  }
}

const useBrokerInfoStore = create<BrokerInfoState>((set) => ({
  brokerInfo: {},
  brokerBound: {},
  isBrokerLoaded: false,
  brokerInfoLoaded: false,
  brokerBoundLoaded: false,
  fetchBrokerInfo: async (trader: string, marginToken: string) => {
    const data = await isIdentityValid(trader)

    if (data) {
      const { data: time = 0 } = await getBrokerRegistrationTime(trader)
      const { data: info = {} } = await getBrokerInfoWithAddress(trader)
      const { data: period = 0 } = await getBrokerValidityPeriod(trader)
      const { data: rank = 0 } = await getBrokerRanking(trader, marginToken)
      const { data: rewards = {} } = await getBrokerRewardsToday(trader, marginToken)

      set({
        brokerInfo: {
          rank,
          period,
          ...info,
          ...rewards,
          registerTime: time
        },
        brokerInfoLoaded: true
      })
    } else {
      set({
        brokerInfoLoaded: true
      })
    }
  },
  fetchBrokerBound: async (trader: string) => {
    const data = await getBrokerBound(trader)

    // console.info(`fetchBrokerBound`)
    // console.info(data?.data)

    set({ brokerBound: data?.data, brokerBoundLoaded: true })
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

export { useBrokerInfoStore }
