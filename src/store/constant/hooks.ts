import { useSelector } from 'react-redux'
import { ConstantState, State } from '@/store/types'

export const useConstantData = (): ConstantState => {
  return useSelector((state: State) => {
    return {
      DRFPool: state.constant.DRFPool,
      bBUSDPool: state.constant.bBUSDPool,
      indicator: state.constant.indicator,
      posFeeRatio: state.constant.posFeeRatio
    }
  })
}
