import { create } from 'zustand'

import { SysParamsState } from '@/store/types'
import {
  initRewardsParams,
  initClearingParams,
  initExchangeParams,
  initProtocolParams,
  initGrantPlanParams
} from '@/hooks/useSysParams'

export const sysParams = {
  ...initRewardsParams,
  ...initExchangeParams,
  ...initProtocolParams,
  ...initClearingParams,
  ...initGrantPlanParams
}

const useSysParamsStore = create<SysParamsState>((set, get) => ({
  sysParams: sysParams,
  loaded: false,
  updateSysParams: (data: typeof sysParams) =>
    set(() => {
      console.info('updateSysParams:')
      console.info(data)
      return { sysParams: data, loaded: true }
    })
}))

export { useSysParamsStore }
