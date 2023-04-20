import { isEmpty } from 'lodash'
import { useEffect } from 'react'

import { usePairIndicator } from '@/hooks/useQueryApi'
import { useMarginTokenStore, usePairsInfoStore } from '@/store'

export default function IndicatorsUpdater(): null {
  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const { data: indicatorDAT } = usePairIndicator(marginToken)

  const updateIndicators = usePairsInfoStore((state) => state.updateIndicators)

  // for quote token indicators
  useEffect(() => {
    if (!isEmpty(indicatorDAT)) {
      updateIndicators(indicatorDAT)
    }
  }, [indicatorDAT])

  return null
}
