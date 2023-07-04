import { get } from '@/utils/http'

export const searchMarginToken = async (key: string) => {
  const response = await get(`api/search_margin_token/${key}`)
  return response
}

export const getMarginIndicators = async (token: string) => {
  const response = await get(`api/app_data/${token}`)
  return response
}

export const getMarginTokenList = async (page = 0, size = 10) => {
  const response = await get(`api/margin_token_list_apy/${page}/5`)
  return response
}

export const getAllMarginTokenList = async () => {
  const response = await get('api/all_margin_token_list')
  return response
}

export const getAllMarginPositions = async () => {
  const response = await get('api/margin_token_total_positions')
  return response
}

export const checkMarginToken = async (symbol: string) => {
  const response = await get(`api/check_margin_token/${symbol}`)
  return response
}
