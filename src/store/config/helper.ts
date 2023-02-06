import { isEmpty } from 'lodash'

import { multicall } from '@/utils/multicall'
import { MARGIN_TOKENS } from '@/config/tokens'
import { getAddress, getDerifyProtocolAddress } from '@/utils/addressHelpers'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

const initial = (): Record<string, any> => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: {
        derifyRewards: '',
        derifyExchange: '',
      },
      [getAddress(t.address)]: {
        derifyRewards: '',
        derifyExchange: '',
      },
      [t.symbol.toLowerCase()]: {
        derifyRewards: '',
        derifyExchange: '',
      }
    }
  })

  return value
}

export const getMarginTokenContractConfig = async () => {
  let output = initial()

  const calls = MARGIN_TOKENS.map((t) => ({
    name: 'marginTokenContractCollections',
    params: [getAddress(t.address)],
    address: getDerifyProtocolAddress()
  }))

  try {
    const response = await multicall(DerifyProtocolAbi, calls)

    if (!isEmpty(response)) {
      response.forEach(([, , , derifyExchange, , derifyRewards]: any[], index: number) => {
        output = {
          ...output,
          [MARGIN_TOKENS[index].symbol]: { derifyExchange, derifyRewards },
          [getAddress(MARGIN_TOKENS[index].address)]: { derifyExchange, derifyRewards },
          [MARGIN_TOKENS[index].symbol.toLowerCase()]: { derifyExchange, derifyRewards }
        }
      })
      console.info(output)
      return output
    }
    return output
  } catch (e) {
    console.info(e)
    return output
  }
}
