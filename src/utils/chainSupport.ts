import { last, sortBy } from 'lodash'
import { StaticJsonRpcProvider } from '@ethersproject/providers'

import { ChainId } from '@/typings'
import { BEST_RPC_KEY } from '@/zustand'
import { checkRpcHealthStatus } from '@/api'

type Rec = Record<string, any>
type Fmt = {
  url: string
  height: number | null
  latency: number | null
}

const rpcBody = {
  jsonrpc: '2.0',
  method: 'eth_getBlockByNumber',
  params: ['latest', false],
  id: 1
}

export const DEFAULT_PRC_URLS = {
  [ChainId.MAINNET]: 'https://bsc-dataseed1.binance.org',
  [ChainId.TESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545'
}

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID ?? ChainId.TESTNET

const rpcReturnFormat = (url: string, data: Rec): Fmt => {
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

export const chainId = Number(CHAIN_ID)

export const defaultPrc = DEFAULT_PRC_URLS[CHAIN_ID]

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

export const getHealthyNode = async (chainId = ChainId.TESTNET): Promise<string> => {
  const json = await loadJsonFile('rpcs', '')
  const rpcList = json[chainId].rpc

  const queries = rpcList.map((rpc: string) => checkRpcHealthStatus(rpc, rpcBody))

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
    return last(sorted)?.url || defaultPrc
  }

  return defaultPrc
}

export const getJsonRpcProvider = (r?: string): StaticJsonRpcProvider => {
  let rpc

  if (r) {
    rpc = r
  } else {
    const local = localStorage.getItem(BEST_RPC_KEY)
    rpc = local ? JSON.parse(local)?.state.rpc : defaultPrc
  }

  // console.info(rpc)
  return new StaticJsonRpcProvider(rpc)
}
