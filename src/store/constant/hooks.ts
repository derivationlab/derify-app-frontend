import { useSelector } from 'react-redux'
import { ConstantState, State } from '@/store/types'

export const useConstantData = (): ConstantState => {
  return useSelector((state: State) => {
    return {
      DRFPool: state.constant.DRFPool,
      bDRFPool: state.constant.bDRFPool,
      indicator: state.constant.indicator,
      positions: state.constant.positions,
      posFeeRatio: state.constant.posFeeRatio
    }
  })
}
