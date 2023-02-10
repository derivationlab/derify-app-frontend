import create from 'zustand'
import { flatten, isEmpty } from 'lodash'

import multicall from '@/utils/multicall'
import { ConfigInfoState } from '@/zustand/types'
import { getAddress, getDerifyProtocolAddress } from '@/utils/addressHelpers'
import { BASE_TOKEN_SYMBOL, MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

import DerifyFactoryAbi from '@/config/abi/DerifyFactory.json'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

const contractInfo = {
  factory: '',
  rewards: '',
  exchange: ''
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

const useConfigInfo = create<ConfigInfoState>((set, get) => ({
  marginToken: BASE_TOKEN_SYMBOL as MarginTokenKeys,
  factoryConfig: initialConfigFromFactory(),
  protocolConfig: initialConfigFromProtocol(),
  factoryConfigLoaded: false,
  protocolConfigLoaded: false,
  getProtocolConfig: async () => {
    const data = await getConfigFromProtocol()
    // console.info(data)
    set({ protocolConfig: data, protocolConfigLoaded: true })
  },
  getFactoryConfig: async () => {
    const data = await getConfigFromFactory(get().protocolConfig)
    // console.info(data)
    set({ factoryConfig: data, factoryConfigLoaded: true })
  },
  setMarginToken: (token: MarginTokenKeys) => {
    set({ marginToken: token })
  },
}))

export { useConfigInfo }
