import create from 'zustand'

import { PoolsInfoState, Rec } from '@/zustand/types'

const usePoolsInfo = create<PoolsInfoState>((set) => ({
  drfPoolBalance: '0',
  bondPoolBalance: '0',
  positionsAmount: {},
  updateDrfPoolBalance: (data: string) =>
    set(() => {
      // console.info(`updateDrfPoolBalance:`)
      // console.info(data)
      return { drfPoolBalance: data }
    }),
  updateBondPoolBalance: (data: string) =>
    set(() => {
      // console.info(`updateBondPoolBalance:`)
      // console.info(data)
      return { bondPoolBalance: data }
    }),
  updatePositionsAmount: (data: Rec) =>
    set(() => {
      // console.info(`updatePositionsAmount:`)
      // console.info(data)
      return { positionsAmount: data }
    })
}))

export { usePoolsInfo }
