import { get } from '@/utils/http'

export const getGrantPlanList = async (
  marginToken: string,
  target: string,
  status: string,
  page: number,
  offset: number
) => {
  const response = await get(`api/grant_list/${marginToken}/${target}/${status}/${page}/${offset}`)
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

export const getCompetitionRank = async (
  marginToken: string,
  status: string,
  grantId: number,
  page?: number,
  offset?: number
) => {
  const response = await get(`api/trading_competition_ranks/${status}/${grantId}`)
  return response
}
