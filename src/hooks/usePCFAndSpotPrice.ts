import { isEmpty, chunk } from 'lodash'
import type { BigNumberish } from '@ethersproject/bignumber'

import { useQueryMulticall } from '@/hooks/useQueryContract'
import { safeInterceptionValues } from '@/utils/tools'
import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

export const initial = (): MarginTokenWithQuote => {
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

export const usePCFAndSpotPrice = (
  p: MarginTokenWithQuote
): { data1?: MarginTokenWithQuote; data2?: MarginTokenWithQuote; isLoading: boolean } => {
  let calls1: any[] = []
  let calls2: any[] = []
  let output1 = initial()
  let output2 = initial()

  for (let k in p) {
    for (let j in p[k as MarginTokenKeys]) {
      calls1.push({
        name: 'getPositionChangeFeeRatio',
        address: p[k as MarginTokenKeys][j as QuoteTokenKeys],
        quoteToken: j,
        marginToken: k
      })
      calls2.push({
        name: 'getSpotPrice',
        address: p[k as MarginTokenKeys][j as QuoteTokenKeys],
        quoteToken: j,
        marginToken: k
      })
    }
  }

  const calls = [...calls1, ...calls2]
  const { data, isLoading } = useQueryMulticall(DerifyDerivativeAbi, calls, 3000)

  if (!isLoading && !isEmpty(data)) {
    const _chunk = chunk(data, calls1.length) as any[]
    _chunk[0].forEach((ratio: BigNumberish, index: number) => {
      const _ratio = Number(safeInterceptionValues(String(ratio), 4)) * 100
      const { marginToken, quoteToken } = calls1[index]
      output1[marginToken as MarginTokenKeys] = { ...output1[marginToken as MarginTokenKeys], [quoteToken]: _ratio }
    })
    _chunk[1].forEach((spotPrice: BigNumberish, index: number) => {
      const { marginToken, quoteToken } = calls2[index]
      output2[marginToken as MarginTokenKeys] = {
        ...output2[marginToken as MarginTokenKeys],
        [quoteToken]: safeInterceptionValues(String(spotPrice), 8)
      }
    })
    // console.info(output1)
    // console.info(output2)
    return { data1: output1, data2: output2, isLoading }
  }

  return { isLoading }
}
