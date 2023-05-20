import { useEffect, useState } from 'react'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import { marginTokenList } from '@/store'
import { ProtocolConfig } from '@/typings'
import multicall from '@/utils/multicall'

export const useAllMarginProtocol = (list: (typeof marginTokenList)[]) => {
  const [marginProtocol, setMarginProtocol] = useState<{ [key: string]: ProtocolConfig }>()

  const getAllMarginProtocol = async () => {
    let output = Object.create(null)
    const base = { address: contracts.derifyProtocol.contractAddress }
    const calls = list.map((t) => ({
      name: 'marginTokenContractCollections',
      params: [t.margin_token],
      ...base
    }))

    const response = await multicall(derifyProtocolAbi, calls)

    response.forEach((addresses: any, index: number) => {
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
      output = {
        ...output,
        [list[index].symbol]: {
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

    setMarginProtocol(output)
  }

  useEffect(() => {
    if (list.length) void getAllMarginProtocol()
  }, [list])

  return { marginProtocol }
}
