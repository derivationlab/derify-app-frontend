import { GrantKeys } from '@/typings'
import { get } from '@/utils/http'

const grantTarget: { [key in GrantKeys | 'all']: string } = {
  all: 'all',
  rank: 'rank',
  mining: 'pmr',
  awards: 'broker_rewards'
}

export const getGrantPlanList = async (
  marginToken: string,
  target: string,
  status: string,
  page: number,
  offset: number
) => {
  const response = await get(
    `api/grant_list/${marginToken}/${grantTarget[target as GrantKeys]}/${status}/${page}/${offset}`
  )
  return response
}

export const getGrantPlanCount = async (marginToken: string) => {
  const response = await get(`api/active_rank_grant_count/${marginToken}`)
  return response
}

export const getGrantPlanAmount = async (marginToken: string) => {
  const response = await get(`api/active_rank_grant_total_amount/${marginToken}`)
  return response
}

export const getGrantPlanRatios = async (marginToken: string, trader: string) => {
  const response = await get(`api/active_rank_grant_ratios/${marginToken}/${trader}`)
  return response
}

export const getCompetitionList = async (marginToken: string, page?: number, offset?: number) => {
  const response = await get(`api/trading_competition_list/${marginToken}`)
  return response
}

export const getCompetitionRank = async (status: string, grantId: string, page?: number, offset?: number) => {
  const response = await get(`api/trading_competition_ranks/${status}/${grantId}`)
  return response
}
