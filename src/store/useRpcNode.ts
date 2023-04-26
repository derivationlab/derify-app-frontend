import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { last, sortBy } from 'lodash'

import { checkRpcHealthStatus } from '@/api'
import { RpcNodeState, WalletState } from '@/store/types'
import { CHAIN_ID, DEFAULT_PRC_URLS } from '@/config'

const loadJsonFile = (key: string, path = '/abi'): Promise<Record<string, any>> => {
  return new Promise((resolve, reject) => {
    import(`@/config${path}/${key}.json`)
      .then((data) => {
        resolve(data.default)
      })
      .catch((e) => {
        reject(e)
      })
  })
}

const getHealthyNode = async (): Promise<string> => {
  const json = await loadJsonFile('rpcs', '')
  const rpcList = json[CHAIN_ID].rpc
  const queries = rpcList.map((rpc: string) =>
    checkRpcHealthStatus(rpc, {
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
      id: 1
    })
  )

  const response = await Promise.all(
    queries.map((p: any) =>
      p
        .then((value: any) => ({
          status: 'fulfilled',
          value
        }))
        .catch((reason: any) => ({
          status: 'rejected',
          reason
        }))
    )
  )

  const chains = response.map((data, i) => rpcReturnFormat(rpcList[i], data)).filter((data) => data.height)
  // console.info(chains)
  if (chains.length) {
    const sorted = sortBy(chains, ['height', 'latency'])
    // console.info(sorted, last(sorted)?.url)
    return last(sorted)?.url || DEFAULT_PRC_URLS[CHAIN_ID]
  }

  return DEFAULT_PRC_URLS[CHAIN_ID]
}

const rpcReturnFormat = (
  url: string,
  data: Record<string, any>
): {
  url: string
  height: number | null
  latency: number | null
} => {
  let height = data?.value?.result?.number ?? null
  let latency = data?.value?.latency ?? null
  if (height) {
    const hex = height.toString(16)
    height = parseInt(hex, 16)
  } else {
    latency = null
  }
  return { url, height, latency }
}

const useRpcNodeStore = create(
  persist<RpcNodeState>(
    (set) => ({
      rpc: DEFAULT_PRC_URLS[CHAIN_ID],
      fetch: async () => {
        const node = await getHealthyNode()

        // console.info(`best node: ${node}`)

        set({ rpc: node })
      }
    }),
    {
      name: 'best-rpc'
    }
  )
)

const useWalletStore = create<WalletState>((set) => ({
  account: '',
  loaded: false,
  updateAccount: (data: string) => set(() => ({ account: data, loaded: true }))
}))

export { useRpcNodeStore, useWalletStore }
