import { useTranslation } from 'react-i18next'
import React, { FC, useMemo } from 'react'

import { isLTET, keepDecimals } from '@/utils/tools'
import { useQuoteToken } from '@/store'
import { useIndicatorsConf } from '@/hooks/useMatchConf'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import Button from '@/components/common/Button'

interface Props {
  address?: string
  isKline: boolean
  goBench: () => void
}

const MobileFixed: FC<Props> = ({ address, isKline, goBench }) => {
  const { t } = useTranslation()

  const quoteToken = useQuoteToken((state) => state.quoteToken)

  const { indicators } = useIndicatorsConf(quoteToken)

  const memoLongPosApy = useMemo(() => {
    const p = Number(indicators?.longPmrRate)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [indicators])

  const memoShortPosApy = useMemo(() => {
    const p = Number(indicators?.shortPmrRate)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
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
              {keepDecimals(memoLongPosApy, 2)}%<u>APR</u>
            </em>
          </Button>
          <Button className="web-trade-bench-button-short" onClick={goBench} type="sell">
            <strong>{t('Trade.Bench.Short', 'Short')}</strong>
            <em>
              {keepDecimals(memoShortPosApy, 2)}%<u>APR</u>
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
