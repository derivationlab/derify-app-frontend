import { useTranslation } from 'react-i18next'
import React, { FC, useMemo } from 'react'
import { isLTET, keepDecimals } from '@/utils/tools'
import { useMarginIndicatorsStore, useQuoteTokenStore } from '@/store'
import ConnectButton from '@/components/common/Wallet/ConnectButton'
import Button from '@/components/common/Button'

interface Props {
  address?: string
  isKline: boolean
  goBench: () => void
}

const MobileFixed: FC<Props> = ({ address, isKline, goBench }) => {
  const { t } = useTranslation()

  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)

  const memoLongPosApy = useMemo(() => {
    const p = Number(marginIndicators?.[quoteToken.address]?.longPmrRate ?? 0)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [quoteToken, marginIndicators])

  const memoShortPosApy = useMemo(() => {
    const p = Number(marginIndicators?.[quoteToken.address]?.shortPmrRate)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [quoteToken, marginIndicators])

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
