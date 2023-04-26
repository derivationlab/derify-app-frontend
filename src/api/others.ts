import { get, post } from '@/utils/http'
import { KLineTimes } from '@/data'

export const getKLineDAT = async (token: string, time: number, endTime: number, limit: number) => {
  const interval = (KLineTimes.find((item) => item.value === time) ?? {}).label ?? '5m'
  const startTime = endTime - time * limit
  const { data } = await get(`api/klines/${token}/${interval}/${~~(startTime / 1000)}/${~~(endTime / 1000)}/${limit}`)
  return data
}

export const getIpLocation = async () => {
  const response = await get('https://bnb.openleverage.finance/api/ip/disable')
  return response
}

export const getPairIndicator = async (token: string) => {
  const response = await get(`api/app_data/${token}`)
  return response
}

export const getBuyBackParams = async (marginToken: string) => {
  const response = await get(
    `https://admin-test-api.derify.exchange/sys/param`,
    { marginToken },
    {
      headers: {
        'x-access-token':
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJEZXJpZnlBZG1pbiIsInJvbGUiOjIsImlhdCI6MTY4MTc0NjQzNCwiZXhwIjoxNjgxNzg5NjM0fQ.AyHx17ctarfU2suuJrCovFf2iMxAQoh7alzOtydnEdE'
      }
    }
  )
  return response
}

export const getTradersRankList = async (marginToken: string, page: number, offset: number) => {
  const response = await get(`api/traders_rank_list/${marginToken}/${page}/${offset}`)
  return response
}

export const getTraderWithdrawAmount = async (trader: string, amount: number, marginToken: string) => {
  const response = await get(`api/trader_withdraw_amounts/${trader}/${amount}/${marginToken}`)
  return response
}

export const getMySpaceMarginTokenList = async (trader: string, page: number, offset: number) => {
  const response = await get(`api/margin_token_list/${trader}/${page}/${offset}`)
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