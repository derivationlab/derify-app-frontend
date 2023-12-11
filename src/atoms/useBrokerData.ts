import {
  getBrokerBoundInfo,
  getBrokerInfoWithAddress,
  getBrokerRanking,
  getBrokerRegistrationTime,
  getBrokerValidityPeriod
} from 'derify-apis-v22'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { Rec } from '@/typings'
import { getProtocolContract } from '@/utils/contractHelpers'

export const brokerInfoAtom = atom<Rec | null>(null)
export const brokerRankingAtom = atom<number | null>(null)
export const userBrokerBoundAtom = atom<Rec | undefined | null>(undefined)
export const brokerSignUpTimeAtom = atom<string | null>(null)
export const whetherUserIsBrokerAtom = atom<boolean | undefined>(undefined)
export const brokerPrivilegesValidityPeriodAtom = atom<number>(0)

type UserAccount = string | undefined

interface BrokerRankingAtomParams {
  marginToken: string
  userAccount: UserAccount
}

export const asyncBrokerRankingAtom = atomFamily((params: BrokerRankingAtomParams) =>
  atom(null, async (get, set) => {
    const { userAccount, marginToken } = params
    try {
      if (userAccount && marginToken) {
        const { data } = await getBrokerRanking<{ data: number | null }>(userAccount, marginToken)
        set(brokerRankingAtom, data ?? null)
      }
    } catch (e) {
      set(brokerRankingAtom, null)
    }
  })
)

export const asyncBrokerInfoAtom = atomFamily((userAccount: UserAccount) =>
  atom(null, async (get, set) => {
    /**
     * request result:
     * 1: {}            = The account is not a broker
     * 2: data:{xx: xx} = The account is a broker
     */
    try {
      if (userAccount) {
        const { data } = await getBrokerInfoWithAddress<{ data: Rec }>(userAccount)
        set(brokerInfoAtom, data ?? null)
      }
    } catch (e) {
      set(brokerInfoAtom, null)
    }
  })
)

export const asyncBrokerSignUpTimeAtom = atomFamily((userAccount: UserAccount) =>
  atom(null, async (get, set) => {
    try {
      if (userAccount) {
        const { data } = await getBrokerRegistrationTime<{ data: string }>(userAccount)
        set(brokerSignUpTimeAtom, data ?? null)
      }
    } catch (e) {
      set(brokerSignUpTimeAtom, null)
    }
  })
)

export const asyncBrokerPrivilegesValidityPeriodAtom = atomFamily((userAccount: UserAccount) =>
  atom(null, async (get, set) => {
    /**
     * request result:
     * 1: -x / x                = Expired / not expired
     * 2: error: GBI_NOT_BROKER = The account is not a broker
     */
    try {
      if (userAccount) {
        const { data } = await getBrokerValidityPeriod<{ data: number }>(userAccount)
        set(brokerPrivilegesValidityPeriodAtom, data ?? 0)
      }
    } catch (e) {
      set(brokerPrivilegesValidityPeriodAtom, 0)
    }
  })
)

export const asyncWhetherUserIsBrokerAtom = atomFamily((userAccount: UserAccount) =>
  atom(undefined, async (get, set) => {
    const contract = getProtocolContract()
    try {
      if (userAccount) {
        await contract.getBrokerInfo(userAccount)
        set(whetherUserIsBrokerAtom, true)
      }
    } catch (e) {
      set(whetherUserIsBrokerAtom, false)
    }
  })
)

export const asyncUserBrokerBoundAtom = atomFamily((userAccount: UserAccount) =>
  atom(undefined, async (get, set) => {
    try {
      if (userAccount) {
        const { data } = await getBrokerBoundInfo<{ data: Rec }>(userAccount)
        set(userBrokerBoundAtom, data ?? null)
      }
    } catch (e) {
      set(userBrokerBoundAtom, undefined)
    }
  })
)
