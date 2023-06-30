import { useAccount } from 'wagmi'

import React, { FC, PropsWithChildren, useMemo } from 'react'

import BrokerConnect from '@/pages/web/Broker/c/Connect'

const IsItConnected: FC<PropsWithChildren<any>> = ({ children }) => {
  const { address } = useAccount()

  return useMemo(() => {
    if (!address) return <BrokerConnect />
    return children
  }, [address])
}

export default IsItConnected
