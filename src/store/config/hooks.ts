import { useSelector } from 'react-redux'

import { ContractConfigState, State } from '@/store/types'

export const useContractConfig = (): ContractConfigState => {
  return useSelector((state: State) => state.contractConfig)
}
