import { useSelector } from 'react-redux'

import { ShareMessageState, State } from '@/store/types'

export const useShareMessage = (): ShareMessageState => {
  return useSelector((state: State) => state.shareMessage)
}
