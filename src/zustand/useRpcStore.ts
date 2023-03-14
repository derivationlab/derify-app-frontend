import create from 'zustand'
import { persist } from 'zustand/middleware'

import { Rec, RpcState } from '@/zustand/types'
import { defaultPrc, getHealthyNode } from '@/utils/chainSupport'
import { ChainId } from '@/typings'

export const BEST_RPC_KEY = 'best-rpc'

const useRpcStore = create(
  persist<RpcState>(
    (set) => ({
      rpc: defaultPrc,
      // chainId: ChainId.MAINNET,
      fetch: async () => {
        const node = await getHealthyNode()

        // console.info(`best node: ${node}`)
        // emitter.emit(BEST_RPC_KEY, node)

        set({ rpc: node })
      }
      // updateChainId: (data: Rec) =>
      //   set(() => {
      //     console.info('updatePCFRatios:')
      //     console.info(data)
      // return { chainId: data, pcfRatiosLoaded: true }
      // })
    }),
    {
      name: BEST_RPC_KEY
    }
  )
)

export { useRpcStore }
