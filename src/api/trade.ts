import { visibleCount } from '@/pages/web/Trade/KLine/SymbolSelect'
import { Rec } from '@/typings'
import { get, post } from '@/utils/http'

export const getTradingHistory = async (address: string, trader: string, page: number, offset = 10) => {
  const response = await get(`api/trade_records/${trader}/${address}/${page}/${offset}`)
  return response
}

export const getDerivativeIndicator = async (marginToken: string) => {
  const response = await get(`api/app_data/${marginToken}`)
  return response
}

export const getDerivativeList = async (marginToken: string, page = 0, size = visibleCount) => {
  const response = await get(`api/derivative_list/${marginToken}/${page}/${size}`)
  return response
}

export const searchDerivative = async (marginToken: string, key: string) => {
  const response = await get(`api/check_derivative/${marginToken}/${key}`)
  return response
}

/**
 * @param marginToken
 * @param trader
 */
export const getFavoritePairsList = async (marginToken: string, trader: string) => {
  const response = await get(`api/trader_token_collection/${trader}/${marginToken}`)
  return response
}

/**
 * trader
 * marginToken
 * token
 * operation: add/delete
 * @param body
 */
export const favoriteTradingPairs = async (body: Rec) => {
  const response = await post('api/collect_token', body)
  return response
}
