import { useAccount } from 'wagmi'

import { useMemo } from 'react'

/**
 * Route switching is prohibited when you are not logged in and are using an broker invitation link.
 * @param pathname
 */
export const useBrokerInvite = (pathname: string): { disabled: boolean } => {
  const { address } = useAccount()
  const disabled = useMemo(() => pathname.includes('/broker/profile/') && !address, [address, pathname])
  return { disabled }
}
