import { get } from '@/utils/http'
import { KLineTimes } from '@/data'

export const getCurrentPositionsAmount = async (tokenAddr: string) => {
  const response = await get(`api/current_positions_amount/${tokenAddr}`)
  return response
}

export const getHistoryPositionsData = async (tokenAddr: string, days: number) => {
  const response = await get(`api/history_positions_amount/${tokenAddr}/${days}`)
  return response
}

export const getTraderTradeFlow = async (trader: string, page: number, offset: number) => {
  const response = await get(`api/trade_records/${trader}/${page}/${offset}`)
  return response
}

export const getKLineData = async (token: string, time: number, endTime: number, limit: number) => {
  const interval = (KLineTimes.find((item) => item.value === time) ?? {}).label ?? '5m'
  const startTime = endTime - time * limit
  const { data } = await get(`api/klines/${token}/${interval}/${~~(startTime / 1000)}/${~~(endTime / 1000)}/${limit}`)
  return data
}

export const getTraderWithdrawAmount = async (trader: string, amount: string) => {
  const response = await get(`api/trader_withdraw_amounts/${trader}/${amount}`)
  return response
}

export const getTraderEDRFBalance = async (trader: string) => {
  const response = await get(`api/trader_latest_edrf_balance/${trader}`)
  return response
}

export const getTraderBondBalance = async (trader: string) => {
  const response = await get(`api/trader_latest_bond_balance/${trader}`)
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
