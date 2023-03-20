import { isEmpty } from 'lodash'
import { useEffect } from 'react'

import { usePairIndicator } from '@/hooks/usePairIndicator'
import { useMarginToken, usePairsInfo } from '@/store'

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
