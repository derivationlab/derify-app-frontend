import ConnectButton from '@/components/common/Wallet/ConnectButton'
import { useAccount } from 'wagmi'
import React, { useMemo } from 'react'

const NotConnect = () => {
  const { address } = useAccount()
  return useMemo(() => {
    if (!address) return (<section className="web-not-connect">
      <ConnectButton />
    </section>)
    return null
  }, [address])
}

export default NotConnect
