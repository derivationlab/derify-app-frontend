import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { useSpotPrice } from '@/hooks/useMatchConf'
import { PositionSideTypes } from '@/typings'

import { useMarginToken, usePairsInfo, useQuoteToken } from '@/store'
import { findToken, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { bnMinus, bnMul, keepDecimals, safeInterceptionValues } from '@/utils/tools'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import Input from '@/components/common/Form/Input'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'

interface Props {
  data?: Record<string, any>
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: (params: Record<string, any>) => void
}

const TakeProfitAndStopLoss: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const { t } = useTranslation()

  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)

  const { spotPrice } = useSpotPrice(quoteToken, marginToken)
  const indicators = usePairsInfo((state) => state.indicators)

  const [stopLossAmount, setStopLossAmount] = useState<any>()
  const [stopLossPrice, setStopLossPrice] = useState<any>('')
  const [takeProfitAmount, setTakeProfitAmount] = useState<any>()
  const [takeProfitPrice, setTakeProfitPrice] = useState<any>('')

  const memoChangeRate = useMemo(() => {
    return Number(indicators?.price_change_rate ?? 0) * 100
  }, [indicators])

  const calcProfitAmountCb = useCallback(
    (v) => {
      if (v && data) {
        const p1 = bnMinus(v, data?.averagePrice)
        const p2 = bnMul(data?.side === PositionSideTypes.long ? 1 : -1, data?.size)
        const amount = bnMul(p1, p2)
        setTakeProfitAmount(keepDecimals(amount, 2))
      } else {
        setTakeProfitAmount(0)
      }
    },
    [data]
  )

  const calcLossAmountCb = useCallback(
    (v) => {
      if (v && data) {
        const amount = new BN(v)
          .minus(data?.averagePrice)
          .times(data?.size)
          .times(data?.side === PositionSideTypes.long ? 1 : -1)
        setStopLossAmount(safeInterceptionValues(String(amount)))
      } else {
        setStopLossAmount(0)
      }
    },
    [data]
  )

  const calcPriceShowFunc = (price: string | number) => {
    return new BN(price).isGreaterThan(0) ? price : '--'
  }

  const calcAmountShowFunc = (price: string | number, amount: string | number) => {
    if (new BN(price).isGreaterThan(0)) return !new BN(amount).isZero() ? `${amount > 0 ? '+' : ''}${amount}` : '--'
    return '--'
  }

  const onChangeTakeProfitPriceEv = (val: any) => {
    if (val === '') {
      setTakeProfitPrice('')
      calcProfitAmountCb(0)
    } else {
      if (val >= 0) {
        setTakeProfitPrice(val)
        calcProfitAmountCb(val)

        if (Number(val) === 0) {
          window.toast.error(t('Trade.TPSL.Tip'))
        }
      }
    }
  }

  const onChangeStopLossPriceEv = (val: any) => {
    if (val === '') {
      setStopLossPrice('')
      calcLossAmountCb(0)
    } else {
      if (val >= 0) {
        setStopLossPrice(val)
        calcLossAmountCb(val)

        if (Number(val) === 0) {
          window.toast.error(t('Trade.TPSL.Tip'))
        }
      }
    }
  }

  const onConfirmEditPosFunc = async () => {
    let SL = 0
    let TP = 0

    if (stopLossPrice !== '' && Number(stopLossPrice) === 0) {
      window.toast.error(t('Trade.TPSL.Tip'))
      return
    }

    if (takeProfitPrice !== '' && Number(takeProfitPrice) === 0) {
      window.toast.error(t('Trade.TPSL.Tip'))
      return
    }

    if (stopLossPrice > 0 && Number(stopLossAmount) > 0) {
      window.toast.error(t('Trade.TPSL.Tip'))
      return
    }

    if (takeProfitPrice > 0 && Number(takeProfitAmount) <= 0) {
      window.toast.error(t('Trade.TPSL.Tip'))
      return
    }

    // todo need to be optimized!!!
    if (
      new BN(stopLossPrice).isEqualTo(data?.stopLossPrice) ||
      (stopLossPrice === '' && data?.stopLossPrice === '--')
    ) {
      SL = 0
    } else if (stopLossPrice === '') {
      SL = -1
    } else {
      SL = stopLossPrice
    }

    // todo need to be optimized!!!
    if (
      new BN(takeProfitPrice).isEqualTo(data?.takeProfitPrice) ||
      (takeProfitPrice === '' && data?.takeProfitPrice === '--')
    ) {
      TP = 0
    } else if (takeProfitPrice === '') {
      TP = -1
    } else {
      TP = takeProfitPrice
    }

    const params = {
      token: findToken(quoteToken)?.tokenAddress,
      side: data?.side,
      TP,
      SL
    }

    onClick(params)
  }

  const memoTakeProfit = useMemo(() => {
    return (
      <p>
        <em className="buy">
          {data?.side === PositionSideTypes.long ? '>' : '<'} {safeInterceptionValues(data?.averagePrice ?? 0)}
        </em>
        <u>{VALUATION_TOKEN_SYMBOL}</u>
      </p>
    )
  }, [data])

  const memoStopLoss = useMemo(() => {
    return (
      <p>
        <em className="buy">
          {data?.side === PositionSideTypes.short ? '>' : '<'} {safeInterceptionValues(data?.averagePrice ?? 0)}
        </em>
        <u>{VALUATION_TOKEN_SYMBOL}</u>
      </p>
    )
  }, [data])

  useEffect(() => {
    if (data && visible) {
      const { takeProfitPrice, stopLossPrice } = data // '--'

      if (takeProfitPrice > 0) {
        calcProfitAmountCb(takeProfitPrice)
        setTakeProfitPrice(takeProfitPrice)
      }
      if (stopLossPrice > 0) {
        calcLossAmountCb(stopLossPrice)
        setStopLossPrice(stopLossPrice)
      }
    }
  }, [visible])

  useEffect(() => {
    if (!visible) {
      setStopLossAmount('')
      setTakeProfitAmount('')
      setTakeProfitPrice('')
      setStopLossPrice('')
    }
  }, [visible])

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={t('Trade.TPSL.Title', 'Take Profit  /  Stop Loss')}
      onClose={onClose}
    >
      <div className="web-trade-dialog web-trade-dialog-position-close">
        <div className="web-trade-dialog-body">
          <div className="web-trade-dialog-position-info">
            <header className="web-trade-dialog-position-info-header">
              <h4>
                <strong>{`${data?.quoteToken}${VALUATION_TOKEN_SYMBOL}`}</strong>
                <MultipleStatus direction={PositionSideTypes[data?.side] as any} />
              </h4>
            </header>
            <section className="web-trade-dialog-position-info-data">
              <BalanceShow value={spotPrice} unit="" />
              <span className={memoChangeRate >= 0 ? 'buy' : 'sell'}>{memoChangeRate}%</span>
            </section>
            <section className="web-trade-dialog-position-info-count">
              <p>
                {t('Trade.TPSL.PositionAveragePrice', 'Position Average Price')} :{' '}
                <em>
                  {safeInterceptionValues(data?.averagePrice ?? 0)} {VALUATION_TOKEN_SYMBOL}
                </em>
              </p>
            </section>
          </div>
          <div className="web-trade-dialog-edit">
            <header>
              <label>{t('Trade.TPSL.TakeProfit', 'Take Profit')}</label>
              {memoTakeProfit}
            </header>
            <section>
              <Input
                value={takeProfitPrice}
                onChange={onChangeTakeProfitPriceEv}
                suffix={VALUATION_TOKEN_SYMBOL}
                type="number"
              />
              <p>
                {t('Trade.TPSL.TakeProfitTip1', 'When market price reaches')}{' '}
                <strong>{calcPriceShowFunc(takeProfitPrice)}</strong> {VALUATION_TOKEN_SYMBOL},
                {t(
                  'Trade.TPSL.TakeProfitTip2',
                  'it will trigger Take Profit order to close this position. Estimated profit will be'
                )}{' '}
                <em className={Number(takeProfitAmount) > 0 ? 'buy' : 'sell'}>
                  {calcAmountShowFunc(takeProfitPrice, takeProfitAmount)}
                </em>{' '}
                {marginToken}.
              </p>
            </section>
            <header>
              <label>{t('Trade.TPSL.StopLoss', 'Stop Loss')}</label>
              {memoStopLoss}
            </header>
            <section>
              <Input
                value={stopLossPrice}
                onChange={onChangeStopLossPriceEv}
                suffix={VALUATION_TOKEN_SYMBOL}
                type="number"
              />
              <p>
                {t('Trade.TPSL.StopLossTip1', 'When market price reaches')}{' '}
                <strong>{calcPriceShowFunc(stopLossPrice)}</strong> {VALUATION_TOKEN_SYMBOL},
                {t(
                  'Trade.TPSL.StopLossTip2',
                  'it will trigger Stop Loss order to close this position. Estimated loss will be'
                )}{' '}
                <em className={Number(stopLossAmount) > 0 ? 'buy' : 'sell'}>
                  {calcAmountShowFunc(stopLossPrice, stopLossAmount)}
                </em>{' '}
                {marginToken}.
              </p>
            </section>
          </div>
        </div>
        <Button onClick={onConfirmEditPosFunc}>{t('Trade.ClosePosition.Confirm', 'Confirm')}</Button>
      </div>
    </Dialog>
  )
}

TakeProfitAndStopLoss.defaultProps = {}

export default TakeProfitAndStopLoss
