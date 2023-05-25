import { create } from 'zustand'

import { SharingState } from '@/store/types'

export enum SharingEvents {
  connectWallet = 'connectWallet'
}

const useSharingStore = create<SharingState>((set) => ({
  sharing: undefined,
  updateSharing: (data: SharingEvents | undefined) =>
    set(() => {
      // console.info(`updateSharing:${data}`)
      return { sharing: data }
    })
}))

export { useSharingStore }
