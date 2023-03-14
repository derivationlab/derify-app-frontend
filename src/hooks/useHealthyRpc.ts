import { useEffect } from 'react'

import { useRpcStore } from '@/zustand'

export const useHealthyRpc = () => {
  const fetchRpc = useRpcStore((state) => state.fetch)

  useEffect(() => {
    void fetchRpc()
  }, [fetchRpc])
}
