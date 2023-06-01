import React, { FC, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import {
  usePositionOperationStore,
  useMarginTokenStore,
  useTokenSpotPricesStore,
  useMarginIndicatorsStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { PositionSideTypes } from '@/typings'
import { bnMul, isGT, isGTET, keepDecimals, nonBigNumberInterception } from '@/utils/tools'

import QuantityInput from './QuantityInput'

interface Props {
  data?: Record<string, any>
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: () => void
}

const PositionClose: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const { t } = useTranslation()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const closingAmount = usePositionOperationStore((state) => state.closingAmount)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const updateClosingType = usePositionOperationStore((state) => state.updateClosingType)
  const updateClosingAmount = usePositionOperationStore((state) => state.updateClosingAmount)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[data?.derivative] ?? '0'
  }, [data, tokenSpotPrices])

  const memoVolume = useMemo(() => {
    return nonBigNumberInterception(bnMul(spotPrice, data?.size), 2)
  }, [data, spotPrice])

  const memoChangeRate = useMemo(() => {
    const base = marginIndicators?.[data?.token]?.price_change_rate ?? 0
    return bnMul(base, 100)
  }, [marginIndicators])

  useEffect(() => {
    if (!visible) updateClosingAmount('0')

    updateClosingAmount(memoVolume)
  }, [visible, memoVolume])

  useEffect(() => {
    updateClosingType(marginToken.symbol)
  }, [marginToken])

  return (
    <>
      <Dialog
        width="540px"
        visible={visible}
        title={t('Trade.ClosePosition.ClosePosition', 'Close Position')}
        onClose={onClose}
      >
        <div className="web-trade-dialog web-trade-dialog-position-close">
          <div className="web-trade-dialog-body">
            <div className="web-trade-dialog-position-info">
              <header className="web-trade-dialog-position-info-header">
                <h4>
                  <strong>{data?.derivative}</strong>
                  <MultipleStatus multiple={data?.leverage} direction={PositionSideTypes[data?.side] as any} />
                </h4>
              </header>
              <section className="web-trade-dialog-position-info-data">
                <BalanceShow value={spotPrice} unit="" />
                <span className={isGTET(memoChangeRate, 0) ? 'buy' : 'sell'}>{keepDecimals(memoChangeRate, 2)}%</span>
              </section>
              <section className="web-trade-dialog-position-info-count">
                <p>
                  {t('Trade.ClosePosition.PositionAveragePrice', 'Position Average Price')} :{' '}
                  <em>{keepDecimals(data?.averagePrice ?? 0, 2)}</em> {VALUATION_TOKEN_SYMBOL}
                </p>
                <p>
                  {t('Trade.ClosePosition.PositionCloseable', 'Position Closeable')} :{' '}
                  <em>{keepDecimals(data?.size ?? 0, 2)}</em> {data?.derivative?.replace(VALUATION_TOKEN_SYMBOL, '')} /{' '}
                  <em>{keepDecimals(memoVolume, 2)}</em> {marginToken.symbol}
                </p>
              </section>
            </div>
            <QuantityInput
              value={closingAmount}
              maxSwap={memoVolume}
              marginToken={marginToken.symbol}
              onChange={(v) => updateClosingAmount(v as any)}
            />
          </div>
          <Button disabled={!isGT(closingAmount, 0)} onClick={onClick}>
            {t('Trade.ClosePosition.Confirm', 'Confirm')}
          </Button>
        </div>
      </Dialog>
    </>
  )
}

PositionClose.defaultProps = {}

export default PositionClose
