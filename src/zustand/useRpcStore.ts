import create from 'zustand'
import { persist } from 'zustand/middleware'

import { RpcState } from '@/zustand/types'
import { defaultPrc, getHealthyNode } from '@/utils/chainSupport'

export const BEST_RPC_KEY = 'best-rpc'

const useRpcStore = create(
  persist<RpcState>(
    (set) => ({
      rpc: defaultPrc,
      fetch: async () => {
        const node = await getHealthyNode()

        // console.info(`best node: ${node}`)
        // emitter.emit(BEST_RPC_KEY, node)

        set({ rpc: node })
      }
    }),
    {
      name: BEST_RPC_KEY
    }
  )
)

export { useRpcStore }
