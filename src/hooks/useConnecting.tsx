import { useCallback } from 'react'
import { useConnect, ConnectorNotFoundError, ResourceUnavailableError } from 'wagmi'

import { ConnectorIds } from '@/typings'

const useConnecting = () => {
  const { connectAsync, connectors } = useConnect()

  const connectWallet = useCallback(
    async (connectorId: ConnectorIds) => {
      const connector = connectors.find((c) => c.id === connectorId)
      try {
        const connected = await connectAsync({ connector })
        return connected
      } catch (error) {
        if (error instanceof ConnectorNotFoundError || error instanceof ResourceUnavailableError) {
          window.toast.error('Wallet connector is undefined')
        }
      }

      return undefined
    },
    [connectors, connectAsync]
  )

  return { connectWallet }
}

export default useConnecting
