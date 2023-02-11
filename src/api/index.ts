import { post } from '@/utils/http'

export * from './broker'
export * from './trader'
export * from './positions'
export * from './dashboard'

export const checkRpcHealthStatus = async (url: string, body: Record<string, any>) => {
  const response = await post(url, body, undefined, true)
  return response
}