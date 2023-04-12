import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { KLineTimes } from '@/data'
import { formDataPost, get, post } from '@/utils/http'

dayjs.extend(utc)

export const getBrokerRankValue = async (trader: string, marginToken: string) => {
  const response = await get(`api/brokers_rank/${marginToken}/${trader}`)
  return response
}

export const getBrokerInfoByTrader = async (trader: string) => {
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

export const getBrokersRankList = async (page: number, offset: number, marginToken: string) => {
  const response = await get(`api/brokers_rank_list/${marginToken}/${page}/${offset}`)
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

export const getBrokerRewardsToday = async (trader: string, marginToken: string) => {
  const dayStart = dayjs.utc().startOf('day').format()
  const dayEnd = dayjs.utc().endOf('day').format()
  const response = await get(`api/broker_today_reward/${trader}/${marginToken}/${dayStart}/${dayEnd}`)
  return response
}

export const getBrokerAccountFlow = async (broker: string, marginToken: string, page: number, offset: number) => {
  const response = await get(`api/broker_reward_balance/${broker}/${marginToken}/${page}/${offset}`)
  return response
}

export const getBrokerRewardTx = async (broker: string, marginToken: string, page: number, offset: number) => {
  const response = await get(`api/broker_reward_transactions/${broker}/${marginToken}/${page}/${offset}`)
  return response
}

export const getListOfAllUsersOfBroker = async (broker: string, marginToken: string, page: number, offset: number) => {
  const response = await get(`api/traders_of_brokerAddr/${broker}/${marginToken}/${page}/${offset}`)
  return response
}

export const getBrokerRegisterTime = async (broker: string) => {
  const response = await get(`api/broker_apply_time/${broker}`)
  return response
}

export const getCurrentIndexDAT = async (address: string) => {
  const response = await get(`api/current_index_data/${address}`)
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

export const getCurrentTradingAmount = async (address: string, marginToken: string) => {
  const response = await get(`api/current_trading_amount/${address}/${marginToken}`)
  return response
}

export const getHistoryTradingDAT = async (address: string, days: number, marginToken: string) => {
  const response = await get(`api/history_trading_amount/${address}/${days}/${marginToken}`)
  return response
}

export const getCurrentPositionsAmount = async (tokenAddr: string, marginToken: string) => {
  const response = await get(`api/current_positions_amount/${tokenAddr}/${marginToken}`)
  return response
}

export const getHistoryPositionsDAT = async (tokenAddr: string, days: number, address: string) => {
  const response = await get(`api/history_positions_amount/${tokenAddr}/${days}/${address}`)
  return response
}

export const getTraderTradeFlow = async (address: string, trader: string, page: number, offset: number) => {
  const response = await get(`api/trade_records/${trader}/${address}/${page}/${offset}`)
  return response
}

export const getKLineDAT = async (token: string, time: number, endTime: number, limit: number) => {
  const interval = (KLineTimes.find((item) => item.value === time) ?? {}).label ?? '5m'
  const startTime = endTime - time * limit
  const { data } = await get(`api/klines/${token}/${interval}/${~~(startTime / 1000)}/${~~(endTime / 1000)}/${limit}`)
  return data
}

export const getTraderWithdrawAmount = async (trader: string, amount: number, marginToken: string) => {
  const response = await get(`api/trader_withdraw_amounts/${trader}/${amount}/${marginToken}`)
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

export const getPairIndicator = async (token: string) => {
  const response = await get(`api/app_data/${token}`)
  return response
}

export const traderInfoUpdates = async (body: Record<string, any>) => {
  const response = await post('api/trader_info_updates', body)
  return response
}

export const getIpLocation = async () => {
  const response = await get('https://bnb.openleverage.finance/api/ip/disable')
  return response
}

export const checkRpcHealthStatus = async (url: string, body: Record<string, any>) => {
  const response = await post(url, body, undefined, true)
  return response
}

export const getTradersRankList = async (marginToken: string, page: number, offset: number) => {
  const response = await get(`api/traders_rank_list/${marginToken}/${page}/${offset}`)
  return response
}

export const getGrantList = async (
  marginToken: string,
  target: string,
  status: string,
  page: number,
  offset: number
) => {
  const response = await get(`api/grant_list/${marginToken}/${target}/${status}/${page}/${offset}`)
  return response
}

export const getActiveRankGrantCount = async (marginToken: string) => {
  const response = await get(`api/active_rank_grant_count/${marginToken}`)
  return response
}

export const getActiveRankGrantTotalAmount = async (marginToken: string) => {
  const response = await get(`api/active_rank_grant_total_amount/${marginToken}`)
  return response
}

export const getActiveRankGrantRatios = async (marginToken: string, trader: string) => {
  const response = await get(`api/active_rank_grant_ratios/${marginToken}/${trader}`)
  return response
}

export const getCurrentTotalTradingNetValue = async (marginToken: string, quoteToken: string) => {
  const response = await get(`api/current_total_trading_net_value/${quoteToken}/${marginToken}`)
  return response
}

export const getCurrentTotalPositionsNetValue = async (marginToken: string, quoteToken: string) => {
  const response = await get(`api/current_total_positions_net_value/${quoteToken}/${marginToken}`)
  return response
}

export const getHistoryTotalTradingNetValue = async (marginToken: string, quoteToken: string, days = 90) => {
  const response = await get(`api/history_total_trading_net_value/${quoteToken}/${days}/${marginToken}`)
  return response
}

export const getHistoryTotalPositionsNetValue = async (marginToken: string, quoteToken: string, days = 90) => {
  const response = await get(`api/history_total_positions_net_value/${quoteToken}/${days}/${marginToken}`)
  return response
}

export const getMySpaceMarginTokenList = async (trader: string, page: number, offset: number) => {
  const response = await get(`api/margin_token_list/${trader}/${page}/${offset}`)
  return response
}

export const getDashboardMarginTokenList = async (page: number, offset: number) => {
  const response = await get(`api/dashboard_margin_token_list/${page}/${offset}`)
  return response
}

export const getBuyBackMarginTokenList = async (page: number, offset: number) => {
  const response = await get(`api/buy_back_margin_token_list/${page}/${offset}`)
  return response
}

export const getTradingCompetitionRanks = async (marginToken: string, page: number, offset: number) => {
  const response = await get(`api/trading_competition_ranks/${marginToken}`)
  return response
}
