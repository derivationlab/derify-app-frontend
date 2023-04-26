import { get } from '@/utils/http'

export const getHistoryTradingDAT = async (address: string, days: number, marginToken: string) => {
  const response = await get(`api/history_trading_amount/${address}/${days}/${marginToken}`)
  return response
}

export const getHistoryInsuranceDAT = async (days: number, address: string) => {
  const response = await get(`api/history_insurance_pool/${days}/${address}`)
  return response
}

export const getCurrentInsuranceDAT = async (address: string) => {
  const response = await get(`api/current_insurance_pool/${address}`)
  return response
}

export const getHistoryPositionsDAT = async (tokenAddr: string, days: number, address: string) => {
  const response = await get(`api/history_positions_amount/${tokenAddr}/${days}/${address}`)
  return response
}

export const getCurrentPositionsAmount = async (tokenAddr: string, marginToken: string) => {
  const response = await get(`api/current_positions_amount/${tokenAddr}/${marginToken}`)
  return response
}
