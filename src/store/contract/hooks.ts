import { useSelector } from 'react-redux'
import { ContractState, State } from '@/store/types'

export const useContractData = (): ContractState => {
  return useSelector((state: State) => {
    return {
      pairs: state.contract.pairs,
      myOrders: state.contract.myOrders,
      myPositions: state.contract.myPositions,
      currentPair: state.contract.currentPair,
      pairsLoaded: state.contract.pairsLoaded,
      myOrdersLoaded: state.contract.myOrdersLoaded,
      myPositionsLoaded: state.contract.myPositionsLoaded
    }
  })
}
