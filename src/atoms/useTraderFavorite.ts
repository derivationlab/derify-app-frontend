import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { getFavoritePairsList } from '@/api'

export const traderFavoriteAtom = atom<string[]>([])

interface TraderFavorite {
  trader: string | undefined
  marginToken: string
}

export const asyncTraderFavoriteAtom = atomFamily((params: TraderFavorite) =>
  atom([], async (get, set) => {
    const { trader, marginToken } = params
    try {
      if (trader && marginToken) {
        const { data } = await getFavoritePairsList(marginToken, trader)
        set(traderFavoriteAtom, data ?? [])
      }
    } catch (e) {
      set(traderFavoriteAtom, [])
    }
  })
)
