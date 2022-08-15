import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { getEventsData } from '@/api'
import BN from 'bignumber.js'
import { nonBigNumberInterception } from '@/utils/tools'

export const usePairsExtDataPoll = () => {
  useSWR('pairs-extra-data', async () => {
    const { data } = await getEventsData()
    if (data.length) {
      return data.map(
        ({
           token,
           longUsdPmrRate,
           longDrfPmrRate,
           shortDrfPmrRate,
           shortUsdPmrRate,
           price_change_rate,
           ...rest
         }: Record<string, any>) => {
          const long = new BN(longDrfPmrRate).plus(longUsdPmrRate)
          const longPmrRate = nonBigNumberInterception(String(long))

          const short = new BN(shortDrfPmrRate).plus(shortUsdPmrRate)
          const shortPmrRate = nonBigNumberInterception(String(short))

          const price = String(price_change_rate)
          const changeRate = nonBigNumberInterception(price, 4)

          const apyMax = Math.max(Number(longPmrRate), Number(shortPmrRate))

          return {
            ...rest,
            apy: apyMax,
            token: token.toLowerCase(),
            longPmrRate,
            shortPmrRate,
            price_change_rate: changeRate
          }
        }
      )
    }
    return []
  }, {
    refreshInterval: 6000
  })
}

export const usePairsExtData = (): number => {
  const { data = [] } = useSWRImmutable('pairs-extra-data')
  return data
}
