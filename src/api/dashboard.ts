import { get } from '@/utils/http'

export const getIndicatorData = async () => {
  const response = await get('api/current_index_data')
  return response
}

export const getHistoryTradingData = async (tokenAddr: string, days: number) => {
  const response = await get(`api/history_trading_amount/${tokenAddr}/${days}`)
  return response
}

export const getHistoryInsuranceData = async (days: number) => {
  const response = await get(`api/history_insurance_pool/${days}`)
  return response
}

export const getCurrentInsuranceData = async () => {
  const response = await get('api/current_insurance_pool')
  return response
}

export const getCurrentTradingAmount = async (tokenAddr: string) => {
  const response = await get(`api/current_trading_amount/${tokenAddr}`)
  return response
}
