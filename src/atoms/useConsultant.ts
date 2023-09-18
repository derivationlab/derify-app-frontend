import dayjs from 'dayjs'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { PLATFORM_TOKEN } from '@/config/tokens'
import { getConsultantContract } from '@/utils/contractHelpers'
import { formatUnits, safeInterceptionValues } from '@/utils/tools'

export const consultantAtom = atom<{
  amount: string
  startTime: number
  lockedDays: number
  vestingDuration: number
} | null>(null)

type Account = string | undefined

const getLockedDays = (time: number): number => {
  if (time === 0) return 0
  const diff = dayjs().diff(time * 1000)
  return dayjs.duration(diff).days()
}

export const asyncConsultantAtom = atomFamily((account: Account) =>
  atom(null, async (get, set) => {
    try {
      if (account) {
        const contract = getConsultantContract()
        const data = await contract.getInsurance(account)
        const { amount, startTime, vestingDuration } = data
        set(consultantAtom, {
          amount: safeInterceptionValues(amount, 8, PLATFORM_TOKEN.precision),
          startTime: Number(startTime),
          lockedDays: getLockedDays(Number(startTime)),
          vestingDuration: Number(vestingDuration)
        })
      }
    } catch (e) {
      set(consultantAtom, null)
    }
  })
)
