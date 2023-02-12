import { flatten, isEmpty } from 'lodash'

import { useQueryMulticall } from '@/hooks/useQueryContract'
import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

import DerifyFactoryAbi from '@/config/abi/DerifyFactory.json'

export const initial = (): MarginTokenWithQuote => {
  let value = Object.create(null)
  let quote = Object.create(null)

  QUOTE_TOKENS.forEach((t) => {
    quote = {
      ...quote,
      [t.symbol]: ''
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

export const useFactoryConfig = (p: Record<string, any>): { data?: MarginTokenWithQuote; isLoading: boolean } => {
  let output = initial()

  const calls = flatten(
    Object.keys(p).map((key, index) =>
      QUOTE_TOKENS.map((t) => ({
        name: 'getDerivative',
        params: [t.tokenAddress],
        address: p[key].factory,
        quoteToken: t.symbol as QuoteTokenKeys,
        marginToken: key as MarginTokenKeys
      }))
    )
  )

  const { data, isLoading } = useQueryMulticall(DerifyFactoryAbi, calls, 30000)

  if (!isLoading && !isEmpty(data)) {
    data.forEach(([address]: string[], index: number) => {
      const { marginToken, quoteToken } = calls[index]
      output[marginToken] = { ...output[marginToken], [quoteToken]: address }
    })
    // console.info(output)
    return { data: output, isLoading }
  }

  return { isLoading: true }
}