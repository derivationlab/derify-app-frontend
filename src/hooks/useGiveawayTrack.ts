import { giveawayEventTrack } from 'derify-apis-test'

import { useCallback } from 'react'

export const useTrackBindBroker = (address: string | undefined) => {
  const trackBindBrokerEvent = useCallback(
    async (brokerId: string) => {
      if (!address) return
      await giveawayEventTrack({
        value: address as string,
        remark: `${address} has been bound to broker ${brokerId}`,
        event: 'BindBroker'
      })
    },
    [address]
  )

  return {
    trackBindBrokerEvent
  }
}
