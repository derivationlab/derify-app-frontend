import create from 'zustand'

import { DashboardDATState, Rec } from '@/zustand/types'

const useDashboardDAT = create<DashboardDATState>((set) => ({
  dashboardDAT: {},
  updateDashboardDAT: (data: Rec) =>
    set(() => {
      console.info(`updateDashboardDAT:`)
      console.info(data)
      return { dashboardDAT: data }
    })
}))

export { useDashboardDAT }
