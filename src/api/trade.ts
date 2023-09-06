import { TRADING_VISIBLE_COUNT } from '@/config'
import { Rec } from '@/typings'
import { get, http, post } from '@/utils/http'

export const getTradingHistory = async (address: string, trader: string, page: number, offset = 10) => {
  const response = await get(`api/trade_records/${trader}/${address}/${page}/${offset}`)
  return response
}

export const getDerivativeIndicator = async (marginToken: string) => {
  const response = await get(`api/app_data/${marginToken}`)
  return response
}

export const getDerivativeList = async (marginToken: string, page = 0, size = TRADING_VISIBLE_COUNT) => {
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
 * name
 * derivative
 * operation: add/delete
 * @param body
 */
export const favoriteTradingPairs = async (body: Rec) => {
  const response = await post('api/collect_token', body)
  return response
}

export const getTradingTokenList = async () => {
  const headers = new Headers()
  headers.append(
    'x-access-token',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJEZXJpZnlBZG1pbiIsInJvbGUiOjIsImlhdCI6MTY5Mzk4NjQ3MiwiZXhwIjoxNjk0MDI5NjcyfQ.dU6o72awPNWK3Fg4Cb4hCyJt5TFK-yn1e3Am0Erls8M'
  )
  const response = await http(
    new Request('https://admin-test-api.derify.exchange/sys/get_derivative_ref_list', {
      method: 'get',
      headers
    })
  )
  return response
}
