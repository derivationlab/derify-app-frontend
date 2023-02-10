import { isEmpty } from 'lodash'
import type { BigNumberish } from '@ethersproject/bignumber'

import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { safeInterceptionValues } from '@/utils/tools'

import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { BigNumber } from '@ethersproject/bignumber'

export const initial = (): Record<string, any> => {
  let value = Object.create(null)
  let quote = Object.create(null)

  QUOTE_TOKENS.forEach((t) => {
    quote = {
      ...quote,
      [t.symbol]: '0'
    }
  })
  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: quote
    }
  })

  return value
}

export const usePCFRatios = (p: Record<string, any>): { data?: Record<string, any>; isLoading: boolean } => {
  let calls: any[] = []
  let output = initial()

  for (let k in p) {
    for (let j in p[k]) {
      calls.push({
        name: 'getPositionChangeFeeRatio',
        address: p[k][j],
        quoteToken: j,
        marginToken: k
      })
    }
  }

  const { data, isLoading } = useQueryMulticall(DerifyDerivativeAbi, calls, 30000)

  if (!isLoading && !isEmpty(data)) {
    data.forEach((ratio: BigNumberish, index: number) => {
      const _ratio = Number(safeInterceptionValues(String(ratio), 4)) * 100
      const { marginToken, quoteToken } = calls[index]
      output[marginToken] = { ...output[marginToken], [quoteToken]: _ratio }
    })
    console.info(output)
    return { data: output, isLoading }
  }

  return { isLoading: true }
}