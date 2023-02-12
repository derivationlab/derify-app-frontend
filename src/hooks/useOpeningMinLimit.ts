import { isEmpty } from 'lodash'
import { BigNumberish } from '@ethersproject/bignumber'

import { MARGIN_TOKENS } from '@/config/tokens'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { safeInterceptionValues } from '@/utils/tools'
import { MarginToken, MarginTokenKeys } from '@/typings'

import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'

export const initial = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0'
    }
  })

  return value
}

export const useOpeningMinLimit = (p: Record<string, any>): { data?: MarginToken; isLoading: boolean } => {
  let output = initial()

  const calls = Object.keys(p).map((key) => ({
    name: 'minOpenAmount',
    address: p[key].exchange,
    marginToken: key as MarginTokenKeys
  }))

  const { data, isLoading } = useQueryMulticall(DerifyExchangeAbi, calls, 30000)

  if (!isLoading && !isEmpty(data)) {
    data.forEach((limit: BigNumberish, index: number) => {
      const { marginToken } = calls[index]
      output = {
        ...output,
        [marginToken]: safeInterceptionValues(String(limit), 8)
      }
    })
    // console.info(output)
    return { data: output, isLoading }
  }

  return { isLoading: true }
}
