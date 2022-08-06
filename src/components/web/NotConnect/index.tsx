import React, { FC, useMemo } from 'react'
import { useAccount } from 'wagmi'

import ConnectButton from '@/components/common/Wallet/ConnectButton'

export interface NotConnect {
  br?: number
}
const NotConnect: FC<NotConnect> = ({ br = 48 }) => {
  const { data: account } = useAccount()
  return useMemo(() => {
    if (!account?.address) {
      return (
        <section className="web-not-connect" style={{ borderRadius: `${br}px` }}>
          <ConnectButton />
        </section>
      )
    }
    return null
  }, [account?.address])
}

export default NotConnect
