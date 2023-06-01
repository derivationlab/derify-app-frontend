import { KLineTimes } from '@/data'
import { useRegionalJudgment } from '@/hooks/useRegionalJudgment'
import { get, post } from '@/utils/http'

export const getKLineDAT = async (token: string, time: number, endTime: number, limit: number) => {
  const interval = (KLineTimes.find((item) => item.value === time) ?? {}).label ?? '1D'
  const startTime = endTime - time * limit
  const { data } = await get(`api/klines/${token}/${interval}/${~~(startTime / 1000)}/${~~(endTime / 1000)}/${limit}`)
  return data
}

export const getRegionalJudgment = async () => {
  const response = await get('https://bnb.openleverage.finance/api/ip/disable')
  return response
}

export const getSystemParams = async (marginToken: string) => {
  const response = await get(`api/sys_param/${marginToken}`)
  return response
}

export const getPairIndicator = async (token: string) => {
  const response = await get(`api/app_data/${token}`)
  return response
}

export const getDerivativeList = async (marginToken: string, page = 0, size = 5) => {
  const response = await get(`api/derivative_list/${marginToken}/${page}/${size}`)
  return response
}

export const getTradersRankList = async (marginToken: string, page: number, size: number) => {
  const response = await get(`api/traders_rank_list/${marginToken}/${page}/${size}`)
  return response
}

export const getTraderWithdrawAmount = async (trader: string, amount: number, marginToken: string) => {
  const response = await get(`api/trader_withdraw_amounts/${trader}/${amount}/${marginToken}`)
  return response
}

export const checkRpcHealthStatus = async (url: string, body: Record<string, any>) => {
  const response = await post(url, body, undefined, true)
  return response
}

export const traderInfoUpdates = async (body: Record<string, any>) => {
  const response = await post('api/trader_info_updates', body)
  return response
}
