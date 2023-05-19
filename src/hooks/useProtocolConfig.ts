import { isEmpty } from 'lodash'

import contracts from '@/config/contracts'
import { MARGIN_TOKENS } from '@/config/tokens'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { bnDiv, bnMul, formatUnits } from '@/utils/tools'
import { MarginTokenWithContract, ProtocolConfig, protocolConfig } from '@/typings'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import { getDerifyProtocolContract } from '@/utils/contractHelpers'

export const initial = (): MarginTokenWithContract => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: protocolConfig
    }
  })

  return value
}

let output = initial()
const base = { address: contracts.derifyProtocol.contractAddress }
const marginCalls = MARGIN_TOKENS.map((t) => ({
  name: 'marginTokenContractCollections',
  params: [t.tokenAddress],
  ...base
}))
const brokerCalls = [
  {
    name: 'brokerApplyNumber',
    ...base
  },
  {
    name: 'brokerValidUnitNumber',
    ...base
  }
]
const calls = [...marginCalls, ...brokerCalls]

export const useProtocolConfig = (): {
  marginData?: typeof output
  brokerData?: { burnLimitAmount: string; burnLimitPerDay: number }
  isLoading: boolean
} => {
  const { data, isLoading } = useQueryMulticall(derifyProtocolAbi, calls, 60000)

  if (!isLoading && !isEmpty(data)) {
    const brokerSlice = data.slice(MARGIN_TOKENS.length)
    const marginSlice = data.slice(0, MARGIN_TOKENS.length)

    marginSlice.forEach((addresses: any, index: number) => {
      const {
        derifyPmr,
        derifyRank,
        bMarginToken,
        derifyFactory,
        derifyRewards,
        derifyExchange,
        derifyClearing,
        derifyBrokerRewards,
        marginTokenPriceFeed
      } = addresses
      // console.info(addresses)
      output = {
        ...output,
        [MARGIN_TOKENS[index].symbol]: {
          rank: derifyRank,
          awards: derifyBrokerRewards,
          mining: derifyPmr,
          rewards: derifyRewards,
          factory: derifyFactory,
          exchange: derifyExchange,
          clearing: derifyClearing,
          priceFeed: marginTokenPriceFeed,
          bMarginToken
        }
      }
    })

    const [brokerApplyNumber, brokerValidUnitNumber] = brokerSlice
    const brokerData = {
      burnLimitAmount: formatUnits(String(brokerApplyNumber)),
      burnLimitPerDay: Math.ceil(bnDiv(bnMul(String(brokerValidUnitNumber), 24 * 3600), 3 * Math.pow(10, 8)) as any)
    }

    return { marginData: output, brokerData, isLoading }
  }

  return { isLoading }
}
