import React, { FC, useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import BN from 'bignumber.js'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useAppDispatch } from '@/store'
import { PositionSide } from '@/store/contract/helper'
import { setShareMessage } from '@/store/share'
import { safeInterceptionValues } from '@/utils/tools'

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

  const [amountInput, setAmountInput] = useState<number>(0)
  const [symbolSelect, setSymbolSelect] = useState<string>(BASE_TOKEN_SYMBOL)

  const memoDisabled = useMemo(() => {
    return new BN(amountInput).isGreaterThan(0)
  }, [amountInput])

  const memoChangeRate = useMemo(() => {
    return new BN(data?.price_change_rate ?? 0).times(100).toString()
  }, [data?.price_change_rate])

  const onConfirmPosInfoEv = () => {
    onClick()
    dispatch(setShareMessage({ symbol: symbolSelect, amount: amountInput, type: 'CLOSE_POSITION' }))
  }

  useEffect(() => {
    if (!visible) {
      setAmountInput(0)
      setSymbolSelect(BASE_TOKEN_SYMBOL)
    }
    setAmountInput(Number(safeInterceptionValues(data?.volume ?? 0)))
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
                  <strong>{data?.name}</strong>
                  <MultipleStatus multiple={data?.leverage} direction={PositionSide[data?.side] as any} />
                </h4>
              </header>
              <section className="web-trade-dialog-position-info-data">
                <BalanceShow value={data?.spotPrice} unit="" />
                <span className={Number(memoChangeRate) >= 0 ? 'buy' : 'sell'}>{memoChangeRate}%</span>
              </section>
              <section className="web-trade-dialog-position-info-count">
                <p>
                  {t('Trade.ClosePosition.PositionAveragePrice', 'Position Average Price')} :{' '}
                  <em>{safeInterceptionValues(data?.averagePrice ?? 0)}</em>
                </p>
                <p>
                  {/* DerifyExchange智能合约接口：getCloseUpperBound todo volume 是否正确 */}
                  {t('Trade.ClosePosition.PositionCloseable', 'Position Closeable')} :{' '}
                  <em>{safeInterceptionValues(data?.size ?? 0, 4)}</em> {data?.symbol} /{' '}
                  <em>{safeInterceptionValues(data?.volume ?? 0)}</em> {BASE_TOKEN_SYMBOL}
                </p>
              </section>
            </div>
            <QuantityInput
              value={amountInput}
              onSymbol={(symbol) => setSymbolSelect(symbol)}
              onChange={(amount) => setAmountInput(amount)}
              maxBUSD={safeInterceptionValues(data?.volume ?? 0) as any}
              maxBase={safeInterceptionValues(data?.size ?? 0, 4) as any}
              baseCoin={data?.symbol}
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
