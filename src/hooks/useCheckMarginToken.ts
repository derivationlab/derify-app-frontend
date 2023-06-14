import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { checkMarginToken } from '@/api'
import { routingWithMarginInfo } from '@/pages/web/Route'
import { useMarginTokenListStore, useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'

export const useCheckMarginToken = () => {
  const { pathname } = useLocation()
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const updateMarginToken = useMarginTokenStore((state: MarginTokenState) => state.updateMarginToken)

  const func = async () => {
    const includes = routingWithMarginInfo.find((r) => pathname.includes(r))
    if (includes) {
      const path = pathname.split('/')
      const { data } = await checkMarginToken(path[1])
      const margin = data ? data[0] : marginTokenList[0]
      updateMarginToken({ logo: margin.logo, address: margin.margin_token, symbol: margin.symbol })
    }
  }

  useEffect(() => {
    void func()
  }, [pathname])
}
