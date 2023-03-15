import create from 'zustand'
import { persist } from 'zustand/middleware'

import { Rec, RpcState } from '@/zustand/types'
import { DEFAULT_PRC_URLS, getHealthyNode } from '@/utils/chainSupport'
import { ChainId } from '@/typings'

export const BEST_RPC_KEY = 'best-rpc'

const useRpcStore = create(
  persist<RpcState>(
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

export { useRpcStore }
