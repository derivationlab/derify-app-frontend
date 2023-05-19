import { useMemo } from 'react'
import { useMarginTokenListStore } from '@/store'

export const useIsMarginToken = (key: string) => {
  const marginTokenSymbol = useMarginTokenListStore((state) => state.marginTokenSymbol)

  return useMemo(() => {
    if (marginTokenSymbol.length) return marginTokenSymbol.includes(key)
    return false
  }, [key, marginTokenSymbol])
}
