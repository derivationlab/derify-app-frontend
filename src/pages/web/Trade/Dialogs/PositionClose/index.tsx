import React, { FC, useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PositionSide } from '@/store/contract/helper'
import { usePairsInfo } from '@/zustand'
import { useSpotPrice } from '@/hooks/useMatchConf'
import { useAppDispatch } from '@/store'
import { setShareMessage } from '@/store/share'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { isGT, safeInterceptionValues } from '@/utils/tools'

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
  const dispatch = useAppDispatch()

  const { spotPrice, marginToken, quoteToken } = useSpotPrice()
  const indicators = usePairsInfo((state) => state.indicators)

  const [amountInput, setAmountInput] = useState<number>(0)
  const [symbolSelect, setSymbolSelect] = useState<string>(BASE_TOKEN_SYMBOL)

  const memoDisabled = useMemo(() => {
    return isGT(amountInput, 0)
  }, [amountInput])

  const memoChangeRate = useMemo(() => {
    return Number(indicators?.price_change_rate ?? 0) * 100
  }, [indicators])

  const onConfirmPosInfoEv = () => {
    onClick()
    dispatch(setShareMessage({ symbol: symbolSelect, amount: amountInput, type: 'CLOSE_POSITION' }))
  }

  useEffect(() => {
    if (!visible) {
      setAmountInput(0)
      setSymbolSelect(BASE_TOKEN_SYMBOL)
    }
    setAmountInput(Number(safeInterceptionValues(data?.volume ?? 0, 8)))
  }, [visible, data?.volume])

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
                  <strong>{`${quoteToken}-${marginToken}`}</strong>
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
                  {quoteToken} / <em>{data?.volume ?? 0}</em> {BASE_TOKEN_SYMBOL}
                </p>
              </section>
            </div>
            <QuantityInput
              value={amountInput}
              onSymbol={(symbol) => setSymbolSelect(symbol)}
              onChange={(amount) => setAmountInput(amount)}
              maxBUSD={(data?.volume ?? 0) as any}
              maxBase={(data?.size ?? 0) as any}
              baseCoin={quoteToken}
            />
          </div>
          <Button disabled={!memoDisabled} onClick={onConfirmPosInfoEv}>
            {t('Trade.ClosePosition.Confirm', 'Confirm')}
          </Button>
        </div>
      </Dialog>
    </>
  )
}

PositionClose.defaultProps = {}

export default PositionClose
