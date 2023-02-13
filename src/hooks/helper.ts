import { flatten, isEmpty } from 'lodash'

import multicall from '@/utils/multicall'
import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

import DerifyFactoryAbi from '@/config/abi/DerifyFactory.json'
import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import { BigNumberish } from '@ethersproject/bignumber'
import { safeInterceptionValues } from '@/utils/tools'
import { getDerifyExchangeContract1 } from '@/utils/contractHelpers'

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

export const initialTraderVariables = {
  marginRate: '0',
  marginBalance: '0',
  totalPositionAmount: '0'
}

export type InitialTraderVariablesType = typeof initialTraderVariables

export const getTraderVariables = async (trader: string, exchange: string): Promise<InitialTraderVariablesType> => {
  const c = getDerifyExchangeContract1(exchange)

  try {
    const { marginRate, marginBalance, totalPositionAmount } = await c.getTraderVariables(trader)
    // console.info('getTraderVariables:')
    // console.info(String(marginRate))
    // console.info(String(marginBalance))
    // console.info(String(totalPositionAmount))
    return {
      marginRate: safeInterceptionValues(marginRate, 4),
      marginBalance: safeInterceptionValues(marginBalance),
      totalPositionAmount: safeInterceptionValues(totalPositionAmount)
    }
  } catch (e) {
    // console.info(e)
    return initialTraderVariables
  }
}

const positionSideKeys = [
  'long',
  'short',
  'twoWay'
]

export const initialOpeningMaxLimit = (): MarginTokenWithQuote => {
  let value = Object.create(null)
  let quote = Object.create(null)

  QUOTE_TOKENS.forEach((t) => {
    quote = {
      ...quote,
      [t.symbol]: {
        long: '0',
        short: '0',
        twoWay: '0'
      }
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

export const getOpeningMaxLimit = async (p: MarginTokenWithContract): Promise<MarginTokenWithQuote> => {
  let output = initialOpeningMaxLimit()

  const calls = flatten(
    Object.keys(p).map((m, mIndex) => {
      const exchange = p[m as MarginTokenKeys].exchange
      const base = {
        name: 'getSysOpenUpperBound',
        address: exchange,
        marginToken: m
      }
      return flatten(QUOTE_TOKENS.map((q, qIndex) => {
        const quoteToken = q.symbol
        return [
          { ...base, params: [q.tokenAddress, 0], quoteToken },
          { ...base, params: [q.tokenAddress, 1], quoteToken },
          { ...base, params: [q.tokenAddress, 2], quoteToken }
        ]
      }))
    })
  )
  // console.info(calls)
  const response = await multicall(DerifyExchangeAbi, calls)
  // console.info(response)
  if (!isEmpty(response)) {
    response.forEach((limit: BigNumberish, index: number) => {
      const { marginToken, quoteToken } = calls[index]
      output[marginToken as MarginTokenKeys] = {
        ...output[marginToken as MarginTokenKeys],
        [quoteToken]: {
          ...output[marginToken as MarginTokenKeys][quoteToken as QuoteTokenKeys],
          [positionSideKeys[calls[index].params[1] as number]]: safeInterceptionValues(String(limit), 8)
        }
      }
    })
    // console.info(output)
    return output
  }

  return output
}
