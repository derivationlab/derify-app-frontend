import React, { FC, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PositionSide } from '@/store/contract/helper'
import { useSpotPrice } from '@/hooks/useMatchConf'
import { useCalcOpeningDAT } from '@/zustand/useCalcOpeningDAT'
import { useMarginToken, usePairsInfo } from '@/zustand'
import { isGT, nonBigNumberInterception, safeInterceptionValues } from '@/utils/tools'

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

const PositionClose: FC<Props> = ({ data, loading, visible, onClose, onClick }) => {
  const { t } = useTranslation()

  const marginToken = useMarginToken((state) => state.marginToken)
  const indicators = usePairsInfo((state) => state.indicators)
  const closingAmount = useCalcOpeningDAT((state) => state.closingAmount)
  const updateClosingType = useCalcOpeningDAT((state) => state.updateClosingType)
  const updateClosingAmount = useCalcOpeningDAT((state) => state.updateClosingAmount)

  const { spotPrice } = useSpotPrice(data?.quoteToken, marginToken)

  const memoDisabled = useMemo(() => {
    return isGT(closingAmount, 0)
  }, [closingAmount])

  const memoChangeRate = useMemo(() => {
    return Number(indicators?.price_change_rate ?? 0) * 100
  }, [indicators])

  const memoVolume = useMemo(() => {
    return Number(spotPrice) * Number(data?.size)
  }, [data, spotPrice])

  useEffect(() => {
    if (!visible) updateClosingAmount(0)

    updateClosingAmount(Number(nonBigNumberInterception(memoVolume, 8)))
  }, [visible, memoVolume])

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
                  <strong>{`${data?.quoteToken}${marginToken}`}</strong>
                  <MultipleStatus multiple={data?.leverage} direction={PositionSide[data?.side] as any} />
                </h4>
              </header>
              <section className="web-trade-dialog-position-info-data">
                <BalanceShow value={spotPrice} unit="" />
                <span className={memoChangeRate >= 0 ? 'buy' : 'sell'}>{memoChangeRate}%</span>
              </section>
              <section className="web-trade-dialog-position-info-count">
                <p>
                  {t('Trade.ClosePosition.PositionAveragePrice', 'Position Average Price')} :{' '}
                  <em>{safeInterceptionValues(data?.averagePrice ?? 0)}</em>
                </p>
                <p>
                  {t('Trade.ClosePosition.PositionCloseable', 'Position Closeable')} : <em>{data?.size ?? 0}</em>{' '}
                  {data?.quoteToken} / <em>{nonBigNumberInterception(memoVolume)}</em> {marginToken}
                </p>
              </section>
            </div>
            <QuantityInput
              value={closingAmount}
              onSymbol={updateClosingType}
              onChange={updateClosingAmount}
              maxBUSD={Number(nonBigNumberInterception(memoVolume, 8))}
              maxBase={(data?.size ?? 0) as any}
              baseCoin={data?.quoteToken}
            />
          </div>
          <Button disabled={!memoDisabled} onClick={onClick}>
            {t('Trade.ClosePosition.Confirm', 'Confirm')}
          </Button>
        </div>
      </Dialog>
    </>
  )
}

PositionClose.defaultProps = {}

export default PositionClose
