import { get } from '@/utils/http'

export const getPlatformTokenPrice = async () => {
  const response = await get('api/drf_price')
  return response
}

export const getBuyBackPlans = async (page: number, offset: number) => {
  const response = await get(`api/buy_back_margin_token_list/${page}/${offset}`)
  return response
}

export const getCurrentIndexDAT = async (address: string) => {
  const response = await get('https://api.derify.exchange/api/current_index_data')
  // const response = await get(`api/current_index_data/${address}`)
  return response
}

export const getCurrentTotalTradingNetValue = async (marginToken: string, quoteToken: string) => {
  const response = await get(`api/current_total_trading_net_value/${quoteToken}/${marginToken}`)
  return response
}

export const getHistoryTotalTradingNetValue = async (marginToken: string, quoteToken: string, days = 90) => {
  const response = await get(`api/history_total_trading_net_value/${quoteToken}/${days}/${marginToken}`)
  return response
}

export const getCurrentTotalPositionsNetValue = async (marginToken: string, quoteToken: string) => {
  const response = await get(`api/current_total_positions_net_value/${quoteToken}/${marginToken}`)
  return response
}

export const getHistoryTotalPositionsNetValue = async (marginToken: string, quoteToken: string, days = 90) => {
  const response = await get(`api/history_total_positions_net_value/${quoteToken}/${days}/${marginToken}`)
  return response
}
