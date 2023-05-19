import { create } from 'zustand'

import { ProtocolConfigState } from '@/store/types'
import { ProtocolConfig } from '@/typings'
import { getDerifyProtocolContract } from '@/utils/contractHelpers'

const protocolContract = getDerifyProtocolContract()

export const getProtocolConfig = async (marginTokenAddress: string): Promise<ProtocolConfig> => {
  const response = await protocolContract.marginTokenContractCollections(marginTokenAddress)

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
  } = response

  return {
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

const useProtocolConfigStore = create<ProtocolConfigState>((set) => ({
  protocolConfig: null,
  protocolConfigLoaded: false,
  getProtocolConfig: async (marginTokenAddress: string) => {
    const protocolConfig = await getProtocolConfig(marginTokenAddress)

    console.info('protocolConfig:')
    console.info(protocolConfig)

    set({ protocolConfig, protocolConfigLoaded: true })
  }
}))

export { useProtocolConfigStore }
