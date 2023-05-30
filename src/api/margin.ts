import { get } from '@/utils/http'

export const getMarginIndicators = async (token: string) => {
  const response = await get(`api/app_data/${token}`)
  return response
}

export const getMarginTokenList = async (page = 0, offset = 30) => {
  const response = await get(`api/margin_token_list_apy/${page}/${offset}`)
  return response
}

export const getMarginAddressList = async () => {
  const response = await get('api/all_margin_token_list')
  return response
}

export const getAllMarginPositions = async () => {
  const response = await get('api/margin_token_total_positions')
  return response
}
