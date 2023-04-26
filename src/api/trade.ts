import { get } from '@/utils/http'

export const getTradingHistory = async (address: string, trader: string, page: number, offset: number) => {
  const response = await get(`api/trade_records/${trader}/${address}/${page}/${offset}`)
  return response
}
