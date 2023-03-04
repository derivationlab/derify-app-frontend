import { useAccount } from 'wagmi'
import React, { FC, useMemo } from 'react'

import { usePairsInfo } from '@/zustand'

export interface NotConnect {
  br?: number
}

const Initializing: FC<NotConnect> = ({ br = 48 }) => {
  const { data: account } = useAccount()

  const pcfRatiosLoaded = usePairsInfo((state) => state.pcfRatiosLoaded)
  const indicatorsLoaded = usePairsInfo((state) => state.indicatorsLoaded)
  const spotPricesLoaded = usePairsInfo((state) => state.spotPricesLoaded)

  return useMemo(() => {
    if (account?.address && (!spotPricesLoaded || !indicatorsLoaded || !pcfRatiosLoaded)) {
      return (
        <section className="web-not-initializing" style={{ borderRadius: `${br}px` }}>
          Initializing...
        </section>
      )
    }
    return null
  }, [spotPricesLoaded, indicatorsLoaded, pcfRatiosLoaded, account?.address])
}

export default Initializing
