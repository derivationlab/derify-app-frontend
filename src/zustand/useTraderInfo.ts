import create from 'zustand'

import { TraderInfoState } from '@/zustand/types'
import { initialTraderVariables, InitialTraderVariablesType } from '@/hooks/helper'

const useTraderInfo = create<TraderInfoState>((set) => ({
  variables: initialTraderVariables,
  variablesLoaded: false,
  updateVariables: (data: InitialTraderVariablesType) =>
    set(() => {
      console.info(`updateVariables:`)
      console.info(data)
      return { variables: data, variablesLoaded: true }
    })
}))

export { useTraderInfo }
