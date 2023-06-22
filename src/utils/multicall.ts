import { ethers } from 'ethers'

import { getMulticallContract } from '@/utils/contractHelpers'

type MultiCallResponse<T> = T | null

export interface Call {
  address: string
  name: string
  params?: any[]
}

interface MulticallOptions {
  requireSuccess?: boolean
}

const contract = getMulticallContract()

export const multicall = async <T = any>(
  abi: any[],
  calls: Call[],
  options: MulticallOptions = { requireSuccess: true }
): Promise<MultiCallResponse<T>> => {
  const { requireSuccess } = options

  const itf = new ethers.utils.Interface(abi)
  const callEncode = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])

  const returnData = await contract.tryAggregate(requireSuccess, callEncode)

  return returnData.map((call: [any, any], i: any) => {
    const [result, data] = call
    return result ? itf.decodeFunctionResult(calls[i].name, data) : null
  })
}

export const multicallV2: (abi: any[], calls: Call[]) => Promise<any[]> = async (abi, calls) => {
  const itf = new ethers.utils.Interface(abi)

  const callData = calls.map((call) => ({
    target: call.address.toLowerCase(),
    callData: itf.encodeFunctionData(call.name, call.params)
  }))

  const returnData = await contract.callStatic.tryAggregate(false, callData)

  return returnData.map((call: [boolean, string], i: number) => {
    const [result, data] = call
    return result && data !== '0x' ? itf.decodeFunctionResult(calls[i].name, data) : null
  })
}

export default multicall
