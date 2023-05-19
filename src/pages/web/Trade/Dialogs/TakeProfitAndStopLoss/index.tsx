import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import Input from '@/components/common/Form/Input'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useMarginIndicatorsStore, useMarginTokenStore, useTokenSpotPricesStore } from '@/store'
import { PositionSideTypes } from '@/typings'
import { bnMinus, bnMul, isET, isGT, keepDecimals, safeInterceptionValues } from '@/utils/tools'

interface Props {
  data?: Record<string, any>
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: (params: Record<string, any>) => void
}

const TakeProfitAndStopLoss: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const { t } = useTranslation()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)

  const [stopLossPrice, setStopLossPrice] = useState<any>('')
  const [stopLossAmount, setStopLossAmount] = useState<any>()
  const [takeProfitPrice, setTakeProfitPrice] = useState<any>('')
  const [takeProfitAmount, setTakeProfitAmount] = useState<any>()

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[data?.derivative] ?? '0'
  }, [data, tokenSpotPrices])

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

  const memoChangeRate = useMemo(() => {
    return bnMul(marginIndicators?.[data?.contract]?.price_change_rate ?? 0, 100)
  }, [marginIndicators])

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
        const p1 = bnMinus(v, data?.averagePrice)
        const p2 = bnMul(p1, data?.size)
        const p3 = bnMul(p2, data?.side === PositionSideTypes.long ? 1 : -1)
        setStopLossAmount(p3)
      } else {
        setStopLossAmount(0)
      }
    },
    [data]
  )

  const calcPriceShowFunc = (price: string | number) => {
    return isGT(price, 0) ? price : '--'
  }

  const calcAmountShowFunc = (price: string | number, amount: string | number) => {
    if (isGT(price, 0)) return Number(amount) !== 0 ? `${amount > 0 ? '+' : ''}${keepDecimals(amount, 2)}` : '--'
    return '--'
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
    if (isET(stopLossPrice, data?.stopLossPrice) || (stopLossPrice === '' && data?.stopLossPrice === '--')) {
      SL = 0
    } else if (stopLossPrice === '') {
      SL = -1
    } else {
      SL = stopLossPrice
    }

    // todo need to be optimized!!!
    if (isET(takeProfitPrice, data?.takeProfitPrice) || (takeProfitPrice === '' && data?.takeProfitPrice === '--')) {
      TP = 0
    } else if (takeProfitPrice === '') {
      TP = -1
    } else {
      TP = takeProfitPrice
    }

    const params = {
      TP,
      SL,
      side: data?.side,
      token: data?.quoteToken
    }

    onClick(params)
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
                <strong>{data?.derivative}</strong>
                <MultipleStatus direction={PositionSideTypes[data?.side] as any} />
              </h4>
            </header>
            <section className="web-trade-dialog-position-info-data">
              <BalanceShow value={spotPrice} unit="" />
              <span className={Number(memoChangeRate) >= 0 ? 'buy' : 'sell'}>{keepDecimals(memoChangeRate, 2)}%</span>
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
                {marginToken.symbol}.
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
                {marginToken.symbol}.
              </p>
            </section>
          </div>
        </div>
        <Button onClick={onConfirmEditPosFunc}>{t('Trade.ClosePosition.Confirm', 'Confirm')}</Button>
      </div>
    </Dialog>
  )
}

export default TakeProfitAndStopLoss
