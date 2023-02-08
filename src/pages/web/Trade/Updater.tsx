import React, { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'

import { useBalancesStore } from '@/zustand'

export default function Updater(): null {
  const { data } = useAccount()
  const { isConnected } = useConnect()
  const resetBalances = useBalancesStore((state) => state.reset)
  const fetchBalances = useBalancesStore((state) => state.fetch)

  useEffect(() => {
    if (!data?.address) void resetBalances()
    else {
      void fetchBalances(data?.address)
    }
  }, [isConnected, data?.address])

  return null
}
