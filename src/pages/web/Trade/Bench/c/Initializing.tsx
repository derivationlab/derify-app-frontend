import React, { FC, useMemo } from 'react'
import { useAccount } from 'wagmi'

import { useContractData } from '@/store/contract/hooks'

export interface NotConnect {
  br?: number
}

const Initializing: FC<NotConnect> = ({ br = 48 }) => {
  const { pairsLoaded } = useContractData()
  const { data: account } = useAccount()

  return useMemo(() => {
    // if (account?.address && !pairsLoaded) {
    //   return (
    //     <section className="web-not-initializing" style={{ borderRadius: `${br}px` }}>
    //       Initializing...
    //     </section>
    //   )
    // }
    return null
  }, [pairsLoaded, account?.address])
}

export default Initializing
