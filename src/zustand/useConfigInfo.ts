import create from 'zustand'
import { persist } from 'zustand/middleware'
import { flatten, isEmpty } from 'lodash'

import multicall from '@/utils/multicall'
import { ConfigInfoState, QuoteTokenState } from '@/zustand/types'
import { getAddress, getDerifyProtocolAddress } from '@/utils/addressHelpers'
import { BASE_TOKEN_SYMBOL, MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

import DerifyFactoryAbi from '@/config/abi/DerifyFactory.json'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import { getDerifyExchangeContract1 } from '@/utils/contractHelpers'
import { safeInterceptionValues } from '@/utils/tools'
import type { BigNumberish } from '@ethersproject/bignumber'

const contractInfo = {
  factory: '',
  rewards: '',
  exchange: ''
}

const initialOpeningMinLimit = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0'
    }
  })

  return value
}

const initialConfigFromFactory = (): MarginTokenWithQuote => {
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

const initialConfigFromProtocol = (): MarginTokenWithContract => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: contractInfo
    }
  })

  return value
}

const getConfigFromProtocol = async () => {
  let output = initialConfigFromProtocol()

  const calls = MARGIN_TOKENS.map((t) => ({
    name: 'marginTokenContractCollections',
    params: [getAddress(t.address)],
    address: getDerifyProtocolAddress()
  }))

  try {
    const response = await multicall(DerifyProtocolAbi, calls)

    if (!isEmpty(response)) {
      response.forEach(([, , , exchange, factory, rewards]: any[], index: number) => {
        output = {
          ...output,
          [MARGIN_TOKENS[index].symbol]: { exchange, rewards, factory }
        }
      })
      // console.info(output)
      return output
    }
    return output
  } catch (e) {
    console.info(e)
    return output
  }
}

const getConfigFromFactory = async (p: Record<string, any>) => {
  const output = initialConfigFromFactory()
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

  try {
    const response = await multicall(DerifyFactoryAbi, calls)
    // console.info(response)
    if (!isEmpty(response)) {
      response.forEach(([address]: string[], index: number) => {
        const { marginToken, quoteToken } = calls[index]
        output[marginToken] = { ...output[marginToken], [quoteToken]: address }
      })
      // console.info(output)
      return output
    }
    return output
  } catch (e) {
    console.info(e)
    return output
  }
}

const getOpeningMinLimit = async (p: Record<string, any>) => {
  let output = initialOpeningMinLimit()

  const calls = Object.keys(p).map((key) => ({
    name: 'minOpenAmount',
    address: p[key].exchange,
    marginToken: key as MarginTokenKeys
  }))
  // console.info(calls)
  try {
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
  } catch (e) {
    console.info(e)
    return output
  }
}

// todo 是否做定时参数更新
const useConfigInfo = create<ConfigInfoState>((set, get) => ({
  marginToken: BASE_TOKEN_SYMBOL as MarginTokenKeys,
  openingMinLimit: initialOpeningMinLimit(),
  factoryConfig: initialConfigFromFactory(),
  protocolConfig: initialConfigFromProtocol(),
  openingMinLimitLoaded: false,
  factoryConfigLoaded: false,
  protocolConfigLoaded: false,
  setMarginToken: (token: MarginTokenKeys) => {
    // console.info(token)
    set({ marginToken: token })
  },
  getFactoryConfig: async () => {
    const data = await getConfigFromFactory(get().protocolConfig)
    // console.info(data)
    set({ factoryConfig: data, factoryConfigLoaded: true })
  },
  getProtocolConfig: async () => {
    const data = await getConfigFromProtocol()
    // console.info(data)
    set({ protocolConfig: data, protocolConfigLoaded: true })
  },
  getOpeningMinLimit: async () => {
    const data = await getOpeningMinLimit(get().protocolConfig)
    // console.info(data)
    set({ openingMinLimit: data, openingMinLimitLoaded: true })
  },
}))

const useQuoteToken = create(
  persist<QuoteTokenState>(
    (set, get) => ({
      quoteToken: QUOTE_TOKENS[0].symbol as QuoteTokenKeys,
      updateQuoteToken: (data: QuoteTokenKeys) => set({ quoteToken: data })
    }),
    {
      name: 'QUOTE_TOKEN'
    }
  )
)

export { useConfigInfo, useQuoteToken }
