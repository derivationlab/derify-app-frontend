import { useSelector } from 'react-redux'
import { State, TraderState } from '@/store/types'

export const useTraderData = (): TraderState => {
  return useSelector((state: State) => {
    return {
      trader: state.trader.trader,
      broker: state.trader.broker,
      brokerBound: state.trader.brokerBound,
      brokerLoaded: state.trader.brokerLoaded,
      brokerBoundLoaded: state.trader.brokerBoundLoaded
    }
  })
}
