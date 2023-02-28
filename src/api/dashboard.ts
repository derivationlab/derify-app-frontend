import { get } from '@/utils/http'

export const getCurrentIndexDAT = async (address: string) => {
  const response = await get(`api/current_index_data/${address}`)
  return response
}

export const getIndicatorData = async () => {
  const response = await get('api/current_index_data')
  return response
}

export const getHistoryTradingData = async (address: string, days: number, marginToken: string) => {
  const response = await get(`api/history_trading_amount/${address}/${days}/${marginToken}`)
  return response
}

export const getHistoryInsuranceData = async (days: number, address: string) => {
  const response = await get(`api/history_insurance_pool/${days}/${address}`)
  return response
}

export const getCurrentInsuranceData = async (address: string) => {
  const response = await get(`api/current_insurance_pool/${address}`)
  return response
}

export const getCurrentTradingAmount = async (address: string, marginToken: string) => {
  const response = await get(`api/current_trading_amount/${address}`)
  // const response = await get(`api/current_trading_amount/${address}/${marginToken}`)
  return response
}
