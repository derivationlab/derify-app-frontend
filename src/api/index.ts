import hmacSHA256 from 'crypto-js/hmac-sha256'

import { GIVEAWAY_API_KEY } from '@/config'
import { KLineTimes } from '@/data'
import { Rec } from '@/typings'
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

export const getTradersRankList = async (marginToken: string, page: number, size: number) => {
  const response = await get(`api/traders_rank_list/${marginToken}/${page}/${size}`)
  return response
}

export const getTraderWithdrawAmount = async (trader: string, amount: string, marginToken: string) => {
  const response = await get(`api/trader_withdraw_amounts/${trader}/${amount}/${marginToken}`)
  return response
}

export const checkRpcHealthStatus = async (url: string, body: Rec) => {
  const response = await post(url, body, undefined, true)
  return response
}

export const traderInfoUpdates = async (body: Rec) => {
  const response = await post('api/trader_info_updates', body)
  return response
}

interface GiveawayParams {
  value: string
  event: string //your chosen event
  remark: string //add remark optional
}

export const giveawayEventTrack = async (body: GiveawayParams) => {
  const { event, value, remark } = body
  const track_id = new URLSearchParams(window.location.search).get('track_id')
  const sign = hmacSHA256(
    `track_id=${track_id}&event=${event}&value=${value}&remark=${remark}`,
    GIVEAWAY_API_KEY
  ).toString()
  const response = await post('https://giveaway.com/public/v1/giveaway/task/callback', {
    sign,
    event,
    value,
    remark,
    track_id
  })
  return response
}

export * from './data'
export * from './earn'
export * from './trade'
export * from './margin'
export * from './broker'
export * from './dashboard'
export * from './competition'
