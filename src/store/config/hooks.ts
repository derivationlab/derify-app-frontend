import { useSelector } from 'react-redux'

import { ConfigState, State } from '@/store/types'

export const useContractConfig = (): ConfigState => {
  return useSelector((state: State) => {
    return {
      protocolConfigLoaded: state.config.protocolConfigLoaded,
      factoryConfigLoaded: state.config.factoryConfigLoaded,
      protocolConfig: state.config.protocolConfig,
      factoryConfig: state.config.factoryConfig,
      marginToken: state.config.marginToken
    }
  })
}
