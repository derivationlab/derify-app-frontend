import { sample } from 'lodash'
import { StaticJsonRpcProvider } from '@ethersproject/providers'

const BSC_MAINNET_RPC_URLS = [
  'https://bsc.nodereal.io',
  'https://bsc-dataseed1.binance.org',
  'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3'
]

const BSC_TESTNET_RPC_URLS = [
  'https://data-seed-prebsc-1-s1.binance.org:8545',
  'https://data-seed-prebsc-1-s3.binance.org:8545'
]

const RPC_URLS: Record<string, string[]> = {
  '56': BSC_MAINNET_RPC_URLS,
  '97': BSC_TESTNET_RPC_URLS
}

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID ?? '56'
const sampleRpcUrl = (chaiId: '56' | '97'): string => sample(RPC_URLS[chaiId]) ?? ''

export const chainId = Number(CHAIN_ID)
export const rpcUrl = sampleRpcUrl(CHAIN_ID)
export const netLabel = chainId === 56 ? 'Mainnet' : 'Testnet'
export const baseProvider = new StaticJsonRpcProvider(rpcUrl)
