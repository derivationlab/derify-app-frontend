import { useAccount } from 'wagmi'

import React, { FC, PropsWithChildren, useMemo } from 'react'

import NotConnect from '@/components/web/NotConnect'

const IsItConnected: FC<PropsWithChildren<any>> = ({ children }) => {
  const { address } = useAccount()

  return useMemo(() => {
    if (!address) return <NotConnect />
    return children
  }, [address])
}

export default IsItConnected
