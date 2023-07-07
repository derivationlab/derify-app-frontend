import { get } from '@/utils/http'

export const getDerivativeIndicator = async (marginToken: string) => {
  const response = await get(`api/app_data/${marginToken}`)
  return response
}

export const getDerivativeList = async (marginToken: string, page = 0, size = 50) => {
  const response = await get(`api/derivative_list/${marginToken}/${page}/${size}`)
  return response
}

export const searchDerivative = async (marginToken: string, key: string) => {
  const response = await get(`api/check_derivative/${marginToken}/${key}`)
  return response
}
