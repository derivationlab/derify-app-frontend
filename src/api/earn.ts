import { get } from '@/utils/http'

export const getTraderEDRFBalance = async (trader: string) => {
  const response = await get(`https://api.derify.exchange/api/trader_latest_edrf_balance/${trader}`)
  return response
}

export const getTraderBondBalance = async (trader: string, address: string) => {
  const response = await get(`api/trader_latest_bond_balance/${trader}/${address}`)
  return response
}

export const getCurrentTradingAmount = async (address: string, marginToken: string) => {
  const response = await get(`api/current_trading_amount/${address}/${marginToken}`)
  return response
}
