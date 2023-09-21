import { getFavoritePairsList } from 'derify-apis-staging'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { Rec } from '@/typings'

export const traderFavoriteAtom = atom<Rec[]>([])

interface TraderFavorite {
  trader: string | undefined
  marginToken: string
}

export const asyncTraderFavoriteAtom = atomFamily((params: TraderFavorite) =>
  atom([], async (get, set) => {
    const { trader, marginToken } = params
    try {
      if (trader && marginToken) {
        const { data = [] } = await getFavoritePairsList<{ data: Rec[] }>(marginToken, trader)
        set(traderFavoriteAtom, data)
      }
    } catch (e) {
      set(traderFavoriteAtom, [])
    }
  })
)
