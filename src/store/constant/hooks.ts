import { useSelector } from 'react-redux'
import { ConstantState, State } from '@/store/types'

export const useConstantData = (): ConstantState => {
  return useSelector((state: State) => {
    return {
      bankBDRF: state.constant.bankBDRF,
      stakingDrf: state.constant.stakingDrf,
      positions: state.constant.positions,
      posFeeRatio: state.constant.posFeeRatio,
      indicator: state.constant.indicator
    }
  })
}
