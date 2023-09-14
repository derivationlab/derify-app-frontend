import { useEffect, useMemo } from 'react'
import { useEffectOnce } from 'react-use'

import { giveawayEventTrack } from '@/api'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { useMarginTokenListStore } from '@/store/useMarginTokenList'

export const useMarginLoading = () => {
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const updateMarginToken = useMarginTokenStore((state: MarginTokenState) => state.updateMarginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const getMarginTokenList = useMarginTokenListStore((state) => state.getMarginTokenList)
  const getAllMarginTokenList = useMarginTokenListStore((state) => state.getAllMarginTokenList)

  const isAccessible = useMemo(() => {
    return marginTokenList.length > 0 && !!marginToken
  }, [marginToken, marginTokenList])

  // Initialize margin token default information
  useEffect(() => {
    const len = marginTokenList.length
    const { address } = marginToken
    if (len && !address) {
      const { open, logo, symbol, margin_token, amount_decimals } = marginTokenList[0]
      updateMarginToken({ open, logo, symbol, address: margin_token, decimals: amount_decimals })
    }
  }, [marginToken, marginTokenList])

  useEffectOnce(() => {
    void getMarginTokenList()
    void getAllMarginTokenList()
  })

  useEffect(() => {
    void giveawayEventTrack({ value: '1', remark: '2', event: 'invite' })
  }, [])

  return {
    isAccessible
  }
}
