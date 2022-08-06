import { ethers } from 'ethers'

const rpcUrl = process.env.REACT_APP_PUBLIC_NODE

export const simpleRpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl)
