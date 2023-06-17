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
    let margin = Object.create(null)
    const includes = routingWithMarginInfo.find((r) => pathname.includes(r))
    if (includes) {
      const path = pathname.split('/')
      const findMargin = marginTokenList.find((m) => m.symbol === path[1])
      if (findMargin) {
        margin = {
          logo: findMargin.logo,
          address: findMargin.margin_token,
          symbol: findMargin.symbol,
          decimals: findMargin.amount_decimals
        }
      } else {
        const { data } = await checkMarginToken(path[1])
        const matchMargin = data ?? marginTokenList[0]
        margin = {
          logo: matchMargin.logo,
          address: matchMargin.margin_token,
          symbol: matchMargin.symbol,
          decimals: matchMargin.amount_decimals
        }
      }
      updateMarginToken(margin)
    }
  }

  useEffect(() => {
    void func()
  }, [pathname])
}
