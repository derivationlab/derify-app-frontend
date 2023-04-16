import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ChainId } from '@/typings'
import { RpcNodeState } from '@/store/types'
import { DEFAULT_PRC_URLS, getHealthyNode } from '@/utils/chainSupport'

export const BEST_RPC_KEY = 'best-rpc'

const useRpcNodeStore = create(
  persist<RpcNodeState>(
    (set) => ({
      rpc: DEFAULT_PRC_URLS[ChainId.TESTNET],
      chainId: ChainId.TESTNET,
      fetch: async (chainId: ChainId) => {
        const node = await getHealthyNode(chainId)

        // console.info(`best node: ${node}`)
        // emitter.emit(BEST_RPC_KEY, node)

        set({ rpc: node })
      }
      // updateChainId: (chainId: ChainId) =>
      //   set(() => {
      //     console.info('updateChainId:')
      //     console.info(chainId)
      // return { chainId }
      // })
    }),
    {
      name: BEST_RPC_KEY
    }
  )
)

export { useRpcNodeStore }
