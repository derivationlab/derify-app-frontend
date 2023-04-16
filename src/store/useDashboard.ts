import { create } from 'zustand'

import { DashboardState, Rec } from '@/store/types'

const useDashboardStore = create<DashboardState>((set) => ({
  dashboardDAT: Object.create(null),
  updateDashboardDAT: (data: Rec) =>
    set(() => {
      // console.info(`updateDashboardDAT:`)
      // console.info(data)
      return { dashboardDAT: data }
    })
}))

export { useDashboardStore }
