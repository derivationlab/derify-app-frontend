import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useEffect } from 'react'

import { PositionSideTypes } from '@/typings'
import { useIndicatorsConf, useSpotPrice } from '@/hooks/useMatchConf'
import { findToken, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useOpeningStore, useMarginTokenStore } from '@/store'
import { bnMul, isGT, isGTET, keepDecimals, nonBigNumberInterception } from '@/utils/tools'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'

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

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const closingAmount = useOpeningStore((state) => state.closingAmount)
  const updateClosingType = useOpeningStore((state) => state.updateClosingType)
  const updateClosingAmount = useOpeningStore((state) => state.updateClosingAmount)

  const { spotPrice } = useSpotPrice(data?.quoteToken, marginToken)
  const { indicators } = useIndicatorsConf(data?.quoteToken)

  const memoVolume = useMemo(() => {
    return nonBigNumberInterception(bnMul(spotPrice, data?.size), findToken(marginToken).decimals)
  }, [data, spotPrice, marginToken])

  const memoChangeRate = useMemo(() => {
    return bnMul(indicators?.price_change_rate ?? 0, 100)
  }, [indicators])

  useEffect(() => {
    if (!visible) updateClosingAmount('0')

    updateClosingAmount(memoVolume)
  }, [visible, memoVolume])

  useEffect(() => {
    updateClosingType(marginToken)
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
                  <strong>{`${data?.quoteToken}${VALUATION_TOKEN_SYMBOL}`}</strong>
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
                  <em>{keepDecimals(data?.size ?? 0, findToken(data?.quoteToken).decimals)}</em> {data?.quoteToken} /{' '}
                  <em>{keepDecimals(memoVolume, findToken(marginToken).decimals)}</em> {marginToken}
                </p>
              </section>
            </div>
            <QuantityInput
              value={closingAmount}
              maxSwap={memoVolume}
              maxSize={data?.size}
              quoteToken={data?.quoteToken}
              marginToken={marginToken}
              onSymbol={updateClosingType}
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
