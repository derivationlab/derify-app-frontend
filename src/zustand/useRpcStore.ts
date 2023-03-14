import create from 'zustand'
import { persist } from 'zustand/middleware'

import { Rec, RpcState } from '@/zustand/types'
import { DEFAULT_PRC_URLS, getHealthyNode } from '@/utils/chainSupport'
import { ChainId } from '@/typings'

export const BEST_RPC_KEY = 'best-rpc'

const useRpcStore = create(
  persist<RpcState>(
    (set) => ({
      rpc: DEFAULT_PRC_URLS[ChainId.MAINNET],
      // chainId: ChainId.MAINNET,
      fetch: async (chainId: ChainId) => {
        const node = await getHealthyNode(chainId)

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
