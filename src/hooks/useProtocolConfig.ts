import { isEmpty } from 'lodash'

import contracts from '@/config/contracts'
import { MARGIN_TOKENS } from '@/config/tokens'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { MarginTokenWithContract } from '@/typings'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

export const contractInfo = {
  factory: '',
  rewards: '',
  exchange: '',
  priceFeed: '',
  bMarginToken: ''
}

export const initial = (): MarginTokenWithContract => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: contractInfo
    }
  })

  return value
}

export const useProtocolConfig = (): { data?: MarginTokenWithContract; isLoading: boolean } => {
  let output = initial()

  const calls = MARGIN_TOKENS.map((t) => ({
    name: 'marginTokenContractCollections',
    params: [t.tokenAddress],
    address: contracts.derifyProtocol.contractAddress
  }))

  const { data, isLoading } = useQueryMulticall(DerifyProtocolAbi, calls, 30000)

  if (!isLoading && !isEmpty(data)) {
    data.forEach((addresses: any, index: number) => {
      const {
        derifyRank,
        bMarginToken,
        derifyFactory,
        derifyRewards,
        derifyExchange,
        derifyAwardsPmr,
        derifyAwardsBroker,
        marginTokenPriceFeed
      } = addresses

      output = {
        ...output,
        [MARGIN_TOKENS[index].symbol]: {
          rank: derifyRank,
          awards: derifyAwardsBroker,
          mining: derifyAwardsPmr,
          rewards: derifyRewards,
          factory: derifyFactory,
          exchange: derifyExchange,
          priceFeed: marginTokenPriceFeed,
          bMarginToken
        }
      }
    })
    console.info(output)
    return { data: output, isLoading }
  }

  return { isLoading }
}
