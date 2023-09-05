import dayjs from 'dayjs'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { PLATFORM_TOKEN } from '@/config/tokens'
import { getConsultantContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

export const consultantAtom = atom<{
  amount: string
  startTime: number
  lockedDays: number
  vestingDuration: number
} | null>(null)

type Account = string | undefined

const getLockedDays = (time: number): number => {
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
        console.info({
          amount: formatUnits(amount, PLATFORM_TOKEN.precision),
          startTime: Number(startTime),
          lockedDays: getLockedDays(Number(startTime)),
          vestingDuration: Number(vestingDuration)
        })
        set(consultantAtom, {
          amount: formatUnits(amount, PLATFORM_TOKEN.precision),
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
