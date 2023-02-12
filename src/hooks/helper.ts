import { chunk, flatten, isEmpty } from 'lodash'

import multicall from '@/utils/multicall'
import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

import DerifyFactoryAbi from '@/config/abi/DerifyFactory.json'
import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import { BigNumberish } from '@ethersproject/bignumber'
import { safeInterceptionValues } from '@/utils/tools'
import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { initial } from '@/hooks/usePCFAndSpotPrice'

export const initialFactoryConfig = (): MarginTokenWithQuote => {
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

export const getFactoryConfig = async (p: MarginTokenWithContract): Promise<MarginTokenWithQuote> => {
  let output = initialFactoryConfig()

  const calls = flatten(
    Object.keys(p).map((key, index) =>
      QUOTE_TOKENS.map((t) => ({
        name: 'getDerivative',
        params: [t.tokenAddress],
        address: p[key as MarginTokenKeys].factory,
        quoteToken: t.symbol as QuoteTokenKeys,
        marginToken: key as MarginTokenKeys
      }))
    )
  )

  const response = await multicall(DerifyFactoryAbi, calls)

  if (!isEmpty(response)) {
    response.forEach(([address]: string[], index: number) => {
      const { marginToken, quoteToken } = calls[index]
      output[marginToken] = { ...output[marginToken], [quoteToken]: address }
    })
    // console.info(output)
    return output
  }

  return output
}

export const initialOpeningMinLimit = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0'
    }
  })

  return value
}

export const getOpeningMinLimit = async (p: MarginTokenWithContract): Promise<MarginToken> => {
  let output = initialOpeningMinLimit()

  const calls = Object.keys(p).map((key) => ({
    name: 'minOpenAmount',
    address: p[key as MarginTokenKeys].exchange,
    marginToken: key as MarginTokenKeys
  }))

  const response = await multicall(DerifyExchangeAbi, calls)

  if (!isEmpty(response)) {
    response.forEach((limit: BigNumberish, index: number) => {
      const { marginToken } = calls[index]
      output = {
        ...output,
        [marginToken]: safeInterceptionValues(String(limit), 8)
      }
    })
    // console.info(output)
    return output
  }

  return output
}

export const initialPCFAndSpotPrice = (): MarginTokenWithQuote => {
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

export const getPCFAndSpotPrice = async (
  p: MarginTokenWithQuote
): Promise<{ data1: MarginTokenWithQuote, data2: MarginTokenWithQuote }> => {
  let calls1: any[] = []
  let calls2: any[] = []
  let output1 = initialPCFAndSpotPrice()
  let output2 = initialPCFAndSpotPrice()

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
  const response = await multicall(DerifyDerivativeAbi, calls)

  if (!isEmpty(response)) {
    const _chunk = chunk(response, calls1.length) as any[]
    _chunk[0].forEach((ratio: BigNumberish, index: number) => {
      const _ratio = Number(safeInterceptionValues(String(ratio), 4)) * 100
      const { marginToken, quoteToken } = calls1[index]
      output1[marginToken as MarginTokenKeys] = { ...output1[marginToken as MarginTokenKeys], [quoteToken]: _ratio }
    })
    _chunk[1].forEach((spotPrice: BigNumberish, index: number) => {
      const { marginToken, quoteToken } = calls2[index]
      output2[marginToken as MarginTokenKeys] = { ...output2[marginToken as MarginTokenKeys], [quoteToken]: safeInterceptionValues(String(spotPrice), 8) }
    })
    // console.info(output1)
    // console.info(output2)
    return { data1: output1, data2: output2 }
  }

  return { data1: output1, data2: output2 }
}
