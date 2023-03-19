import { isEmpty } from 'lodash'
import { useEffect } from 'react'

import { useMarginToken, usePairsInfo } from '@/zustand'
import { usePairIndicator } from '@/hooks/usePairIndicator'

export default function IndicatorsUpdater(): null {
  const marginToken = useMarginToken((state) => state.marginToken)

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
