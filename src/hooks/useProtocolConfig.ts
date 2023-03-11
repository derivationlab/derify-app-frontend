import { isEmpty } from 'lodash'

import contracts from '@/config/contracts'
import { MARGIN_TOKENS } from '@/config/tokens'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { MarginTokenWithContract } from '@/typings'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

export const contractInfo = {
  rank: '',
  awards: '',
  mining: '',
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
  // console.info(calls)
  const { data, isLoading } = useQueryMulticall(DerifyProtocolAbi, calls, 30000)
  /**
   bMarginToken
   :
   "0x60B1ea3Ee150fb09C703168143ea6d58fe273b29"
   derifyBrokerRewards
   :
   "0x545ff472a690681fB702a870122a2AAdA39d2297"
   derifyClearing
   :
   "0x13f1B5f2a50Dee47dF68A6ec15cA31300Ad2bcC0"
   derifyExchange
   :
   "0x6bb172F7813D72ADD33f9552056bB4025555b017"
   derifyFactory
   :
   "0xd813aaFBF9444F45F2e8DF669cF29a73A7Fe7B9c"
   derifyPmr
   :
   "0xc647D96778A9E071c89561b14A8e23D517A4Ac6e"
   derifyRank
   :
   "0xd0A781F3c4eeAd2C012Dbf807AB5fF2Cb887A0E1"
   derifyRewards
   :
   "0xE29570946b2Dea749c40c78f9a87aAd3620cF931"
   marginTokenPriceFeed
   :
   "0xCD84Ba166C63F0F5865E4824e1cB08201B5D0245"
   */
  if (!isLoading && !isEmpty(data)) {
    data.forEach((addresses: any, index: number) => {
      const {
        derifyRank,
        bMarginToken,
        derifyFactory,
        derifyRewards,
        derifyExchange,
        derifyPmr,
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
          priceFeed: marginTokenPriceFeed,
          bMarginToken
        }
      }
    })
    // console.info(output)
    return { data: output, isLoading }
  }

  return { isLoading }
}
