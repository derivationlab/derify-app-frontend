import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo } from 'react'

import { usePairsInfo } from '@/store'
import { bnMul, isLTET } from '@/utils/tools'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import Button from '@/components/common/Button'

interface Props {
  address?: string
  isKline: boolean
  goBench: () => void
}

const MobileFixed: FC<Props> = ({ address, isKline, goBench }) => {
  const { t } = useTranslation()

  const indicators = usePairsInfo((state) => state.indicators)

  const memoLongPosApy = useMemo(() => {
    if (!isEmpty(indicators) && indicators?.longPmrRate) {
      const apy = bnMul(indicators?.longPmrRate, 100)
      return isLTET(apy, 0) ? '--' : apy
    }
    return '--'
  }, [indicators])

  const memoShortPosApy = useMemo(() => {
    if (!isEmpty(indicators) && indicators?.shortPmrRate) {
      const apy = bnMul(indicators?.shortPmrRate, 100)
      return isLTET(apy, 0) ? '--' : apy
    }
    return '--'
  }, [indicators])

  if (!isKline) return null

  return (
    <div className="m-trade-fixed">
      {address ? (
        <>
          <Button className="web-trade-bench-button-short" onClick={goBench} type="buy">
            <strong>{t('Trade.Bench.Long', 'Long')}</strong>
            <em>
              {memoLongPosApy}%<u>APR</u>
            </em>
          </Button>
          <Button className="web-trade-bench-button-short" onClick={goBench} type="sell">
            <strong>{t('Trade.Bench.Short', 'Short')}</strong>
            <em>
              {memoShortPosApy}%<u>APR</u>
            </em>
          </Button>
        </>
      ) : (
        <ConnectButton size="default" />
      )}
    </div>
  )
}

export default MobileFixed
