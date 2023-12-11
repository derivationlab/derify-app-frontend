import { getBrokerRewardsToday } from 'derify-apis-v22'

import { useEffect, useState } from 'react'

const brokerRewardsTodayInit = {
  margin_token_reward: '',
  drf_reward: '',
  txs_num: 0,
  traders_num: 0,
  margin_token_reward_rate: 0
}

export const useBrokerRewardsToday = (address: string | undefined, marginToken: string) => {
  const [brokerRewardsToday, setBrokerRewardsToday] = useState<typeof brokerRewardsTodayInit>(brokerRewardsTodayInit)

  const func = async (address: string) => {
    try {
      const { data } = await getBrokerRewardsToday<{ data: typeof brokerRewardsTodayInit }>(address, marginToken)
      setBrokerRewardsToday(data)
    } catch (e) {
      setBrokerRewardsToday(brokerRewardsTodayInit)
    }
  }

  useEffect(() => {
    if (address && marginToken) void func(address)
  }, [address, marginToken])

  return { brokerRewardsToday }
}
