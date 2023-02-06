import { useSelector } from 'react-redux'

import { ContractConfigState, State } from '@/store/types'

export const useContractConfig = (): ContractConfigState => {
  return useSelector((state: State) => {
    return {
      loaded: state.config.loaded,
      marginToken: state.config.marginToken,
      contractConfig: state.config.contractConfig,
    }
  })
}
