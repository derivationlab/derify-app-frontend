import { isEmpty } from 'lodash'
import { useEffect } from 'react'

import { usePairsInfo } from '@/zustand'
import { usePairIndicator } from '@/hooks/usePairIndicator'
import { useMTokenFromRoute } from '@/hooks/useTrading'

export default function UpdateIndicators(): null {
  const marginToken = useMTokenFromRoute()

  const { data: indicatorDAT } = usePairIndicator(marginToken)

  const updateIndicators = usePairsInfo((state) => state.updateIndicators)

  // for quote token indicators
  useEffect(() => {
    if (!isEmpty(indicatorDAT)) {
      updateIndicators(indicatorDAT)
    }
  }, [indicatorDAT])

  return null
}
