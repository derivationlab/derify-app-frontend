import { get, post } from '@/utils/http'

export * from './broker'
export * from './positions'
export * from './dashboard'

export const claimTestUSDT = async (body: Record<string, any>) => {
  const response = await post('api/send_usdt', body)
  return response
}

export const isClaimedTestUSDT = async (trader: string) => {
  const response = await get(`api/is_usdt_claimed/${trader}`)
  return response
}
