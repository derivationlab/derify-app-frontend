import { useAccount } from 'wagmi'

import { useMemo } from 'react'

export const useBrokerInvite = (pathname: string): boolean => {
  const { address } = useAccount()
  return useMemo(() => pathname.includes('/broker/profile/') && !address, [address, pathname])
}
