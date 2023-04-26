import dayjs from 'dayjs'

import { formDataPost, get, post } from '@/utils/http'

export const updateBrokerInfo = async (body: Record<string, any>) => {
  const response = await formDataPost('api/broker_info_updates', body)
  return response
}

export const bindingYourBroker = async (body: Record<string, any>) => {
  const response = await post('api/bind_broker', body)
  return response
}

export const getBrokerBound = async (trader: string) => {
  const response = await get(`api/broker_info_of_trader/${trader}`)
  return response
}

export const getBrokersList = async (
  marginToken: string,
  page: number,
  offset: number,
  language: string,
  community: string
) => {
  const response = await get(`api/brokers_list/${language}/${community}/${marginToken}/${page}/${offset}`)
  return response
}

export const getBrokerRanking = async (trader: string, marginToken: string) => {
  const response = await get(`api/brokers_rank/${marginToken}/${trader}`)
  return response
}

export const getBrokersRankList = async (page: number, offset: number, marginToken: string) => {
  const response = await get(`api/brokers_rank_list/${marginToken}/${page}/${offset}`)
  return response
}

export const getBrokerSubordinate = async (broker: string, marginToken: string, page: number, offset: number) => {
  const response = await get(`api/traders_of_brokerAddr/${broker}/${marginToken}/${page}/${offset}`)
  return response
}

export const getBrokerTransactions = async (broker: string, marginToken: string, page: number, offset: number) => {
  const response = await get(`api/broker_reward_transactions/${broker}/${marginToken}/${page}/${offset}`)
  return response
}

export const getBrokerRewardsToday = async (trader: string, marginToken: string) => {
  const dayStart = dayjs.utc().startOf('day').format()
  const dayEnd = dayjs.utc().endOf('day').format()
  const response = await get(`api/broker_today_reward/${trader}/${marginToken}/${dayStart}/${dayEnd}`)
  return response
}

export const getBrokerRevenueRecord = async (broker: string, marginToken: string, page: number, offset: number) => {
  const response = await get(`api/broker_reward_balance/${broker}/${marginToken}/${page}/${offset}`)
  return response
}

export const getBrokerValidityPeriod = async (brokerId: string) => {
  const response = await get(`api/broker_latest_valid_period/${brokerId}`)
  return response
}

export const getBrokerRegistrationTime = async (broker: string) => {
  const response = await get(`api/broker_apply_time/${broker}`)
  return response
}

export const getBrokerInfoWithAddress = async (trader: string) => {
  const response = await get(`api/broker_info_by_addr/${trader}`)
  return response
}

export const getBrokerInfoWithBrokerId = async (brokerId: string) => {
  const response = await get(`api/broker_info_by_id/${brokerId}`)
  return response
}
