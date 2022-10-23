import { post } from '@/utils/http'

export const traderInfoUpdates = async (body: Record<string, any>) => {
  const response = await post('api/trader_info_updates', body)
  return response
}
