import hmacSHA256 from 'crypto-js/hmac-sha256'
import { get, post } from 'derify-apis-test'

const GIVEAWAY_API_KEY = 'sWDQ1YiQj6qPFqwOmpln4MUJs0tycOHV1AkxL1ONLCW4t4s5cOlRxaMzu8midtPM'

/**
 *
export const testGet = async (x: string) => {
  const response = await get(`api/trader_withdraw_amounts/${x}`)
  return response
}

export const testPost = async (body: Rec) => {
  const response = await post('api/trader_info_updates', body)
  return response
}
 *
 **/

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
