import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { formDataPost, get, post } from '@/utils/http'

dayjs.extend(utc)

export const getBrokerInfoByTrader = async (trader: string) => {
  const response = await get(`api/broker_info_of_trader/${trader}`)
  return response
}

export const getBrokersList = async (page: number, offset: number, language: string, community: string) => {
  const response = await get(`api/brokers_list/${language}/${community}/${page}/${offset}`)
  return response
}

export const getBrokersRankList = async (page: number, offset: number) => {
  const response = await get(`api/brokers_rank_list/${page}/${offset}`)
  return response
}

export const getBrokerInfoById = async (brokerId: string) => {
  const response = await get(`api/broker_info_by_id/${brokerId}`)
  return response
}

export const getBrokerValidPeriod = async (brokerId: string) => {
  const response = await get(`api/broker_latest_valid_period/${brokerId}`)
  return response
}

export const getBrokerInfoByAddr = async (trader: string) => {
  const response = await get(`api/broker_info_by_addr/${trader}`)
  return response
}

export const bindYourBroker = async (body: Record<string, any>) => {
  const response = await post('api/bind_broker', body)
  return response
}

export const updateBrokerInfo = async (body: Record<string, any>) => {
  const response = await formDataPost('api/broker_info_updates', body)
  return response
}

export const getBrokerRewardsToday = async (trader: string) => {
  const dayStart = dayjs.utc().startOf('day').format()
  const dayEnd = dayjs.utc().endOf('day').format()
  const response = await get(`api/broker_today_reward/${trader}/${dayStart}/${dayEnd}`)
  return response
}

export const getBrokerAccountFlow = async (broker: string, page: number, offset: number) => {
  const response = await get(`api/broker_reward_balance/${broker}/${page}/${offset}`)
  return response
}

export const getBrokerRewardTx = async (broker: string, page: number, offset: number) => {
  const response = await get(`api/broker_reward_transactions/${broker}/${page}/${offset}`)
  return response
}

export const getListOfAllUsersOfBroker = async (broker: string, page: number, offset: number) => {
  const response = await get(`api/traders_of_brokerAddr/${broker}/${page}/${offset}`)
  return response
}

export const getBrokerRegisterTime = async (broker: string) => {
  const response = await get(`api/broker_apply_time/${broker}`)
  return response
}
