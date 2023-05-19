import { useEffect } from 'react'
import { useOpeningMinLimitStore } from '@/store/useOpeningMinLimit'
import { useProtocolConfigStore } from '@/store'

/**
 * Basic parameters for opening positions
 */
export default function OpeningPositionParamsUpdater(): null {
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getOpeningMinLimit = useOpeningMinLimitStore((state) => state.getOpeningMinLimit)

  // Minimum open position amount
  useEffect(() => {
    if (protocolConfig) {
      void getOpeningMinLimit(protocolConfig.exchange)
    }
  }, [protocolConfig])

  return null
}
