import { get } from '@/utils/http'
import { KLineTimes } from '@/data'

export const getCurrentPositionsAmount = async (tokenAddr: string, marginToken: string) => {
  const response = await get(`api/current_positions_amount/${tokenAddr}/${marginToken}`)
  return response
}

export const getHistoryPositionsData = async (tokenAddr: string, days: number, address: string) => {
  const response = await get(`api/history_positions_amount/${tokenAddr}/${days}/${address}`)
  return response
}

export const getTraderTradeFlow = async (address: string, trader: string, page: number, offset: number) => {
  const response = await get(`api/trade_records/${trader}/${address}/${page}/${offset}`)
  return response
}

export const getKLineData = async (token: string, time: number, endTime: number, limit: number) => {
  const interval = (KLineTimes.find((item) => item.value === time) ?? {}).label ?? '5m'
  const startTime = endTime - time * limit
  const { data } = await get(`api/klines/${token}/${interval}/${~~(startTime / 1000)}/${~~(endTime / 1000)}/${limit}`)
  return data
}

export const getTraderWithdrawAmount = async (trader: string, amount: number) => {
  const response = await get(`api/trader_withdraw_amounts/${trader}/${amount}`)
  return response
}

export const getTraderEDRFBalance = async (trader: string) => {
  const response = await get(`api/trader_latest_edrf_balance/${trader}`)
  return response
}

export const getTraderBondBalance = async (trader: string, address: string) => {
  const response = await get(`api/trader_latest_bond_balance/${trader}/${address}`)
  return response
}

export const getEventsData = async () => {
  const response = await get('api/app_data')
  return response
}

export const getPairIndicator = async (token: string) => {
  const response = await get(`api/app_data/${token}`)
  return response
}
