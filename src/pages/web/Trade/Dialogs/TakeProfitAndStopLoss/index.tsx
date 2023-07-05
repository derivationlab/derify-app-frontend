import { debounce } from 'lodash'

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import Input from '@/components/common/Form/Input'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useMarginTokenStore, useTokenSpotPricesStore, useMarginIndicatorsStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { PositionSideTypes, Rec } from '@/typings'
import { bnMinus, bnMul, isET, isGT, keepDecimals } from '@/utils/tools'

interface Props {
  data: Rec
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: (params: Rec) => void
}

const initPnLParams = {
  SLPrice: '',
  SLAmount: '',
  TPPrice: '',
  TPAmount: ''
}

const showPrice = (price: string | number) => {
  return isGT(price, 0) ? price : '--'
}

const TakeProfitAndStopLoss: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const [pnlParams, setPnLParams] = useState<typeof initPnLParams>(initPnLParams)

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPricesForPosition)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)

  const tokenSpotPrice = useMemo(() => {
    if (tokenSpotPrices) {
      const find = tokenSpotPrices.find((t: Rec) => t.name === data.name)
      return find?.price ?? '0'
    }
    return '0'
  }, [data, tokenSpotPrices])

  const memoStopLoss = useMemo(() => {
    const averagePrice = data?.averagePrice ?? 0
    const price = keepDecimals(averagePrice, Number(averagePrice) === 0 ? 2 : data.decimals)
    return (
      <p>
        <em className="buy">
          {data?.side === PositionSideTypes.short ? '>' : '<'} {price}
        </em>
        <u>{VALUATION_TOKEN_SYMBOL}</u>
      </p>
    )
  }, [data])

  const memoChangeRate = useMemo(() => {
    return bnMul(marginIndicators?.[data?.token]?.price_change_rate ?? 0, 100)
  }, [marginIndicators])

  const memoTakeProfit = useMemo(() => {
    const averagePrice = data?.averagePrice ?? 0
    const price = keepDecimals(averagePrice, Number(averagePrice) === 0 ? 2 : data.decimals)
    return (
      <p>
        <em className="buy">
          {data?.side === PositionSideTypes.long ? '>' : '<'} {price}
        </em>
        <u>{VALUATION_TOKEN_SYMBOL}</u>
      </p>
    )
  }, [data])

  const calcLossAmount = useCallback(
    debounce((v) => {
      if (v && data) {
        const p1 = bnMinus(v, data?.averagePrice)
        const p2 = bnMul(p1, data?.size)
        const p3 = bnMul(p2, data?.side === PositionSideTypes.long ? 1 : -1)
        setPnLParams((v) => ({ ...v, SLAmount: p3 }))
      } else {
        setPnLParams((v) => ({ ...v, SLAmount: '0' }))
      }
    }, 1000),
    [data]
  )

  const calcProfitAmount = useCallback(
    debounce((v) => {
      if (v && data) {
        const p1 = bnMinus(v, data?.averagePrice)
        const p2 = bnMul(data?.side === PositionSideTypes.long ? 1 : -1, data?.size)
        const amount = bnMul(p1, p2)
        setPnLParams((v) => ({ ...v, TPAmount: amount }))
      } else {
        setPnLParams((v) => ({ ...v, TPAmount: '0' }))
      }
    }, 1000),
    []
  )

  const stopLossGain = useMemo(() => {
    if (isGT(pnlParams.SLPrice, 0))
      return Number(pnlParams.SLAmount) !== 0
        ? `${Number(pnlParams.SLAmount) > 0 ? '+' : ''}${keepDecimals(pnlParams.SLAmount || 0, marginToken.decimals)}`
        : '--'
    return '--'
  }, [pnlParams.SLPrice, pnlParams.SLAmount, marginToken])

  const takeProfitGain = useMemo(() => {
    if (isGT(pnlParams.TPPrice, 0))
      return Number(pnlParams.TPAmount) !== 0
        ? `${Number(pnlParams.TPAmount) > 0 ? '+' : ''}${keepDecimals(pnlParams.TPAmount || 0, marginToken.decimals)}`
        : '--'
    return '--'
  }, [pnlParams.TPPrice, pnlParams.TPAmount, marginToken])

  const onConfirm = () => {
    let SL: any = 0
    let TP: any = 0

    if (pnlParams.SLPrice !== '' && Number(pnlParams.SLPrice) === 0) {
      window.toast.error(t('Trade.TPSL.Tip'))
      return
    }

    if (pnlParams.TPPrice !== '' && Number(pnlParams.TPPrice) === 0) {
      window.toast.error(t('Trade.TPSL.Tip'))
      return
    }

    if (Number(pnlParams.SLPrice) > 0 && Number(pnlParams.SLAmount) > 0) {
      window.toast.error(t('Trade.TPSL.Tip'))
      return
    }

    if (Number(pnlParams.TPPrice) > 0 && Number(pnlParams.TPAmount) <= 0) {
      window.toast.error(t('Trade.TPSL.Tip'))
      return
    }

    if (isET(pnlParams.SLPrice, data?.stopLossPrice) || (pnlParams.SLPrice === '' && data?.stopLossPrice === '--')) {
      SL = 0
    } else if (pnlParams.SLPrice === '') {
      SL = -1
    } else {
      SL = pnlParams.SLPrice
    }

    if (
      isET(pnlParams.TPPrice, data?.takeProfitPrice) ||
      (pnlParams.TPPrice === '' && data?.takeProfitPrice === '--')
    ) {
      TP = 0
    } else if (pnlParams.TPPrice === '') {
      TP = -1
    } else {
      TP = pnlParams.TPPrice
    }

    const params = {
      TP,
      SL,
      side: data?.side,
      token: data?.quoteToken,
      derivative: data?.derivative
    }

    onClick(params)
  }

  const onChangeSLPrice = (val: any) => {
    if (val === '') {
      setPnLParams((v) => ({ ...v, SLPrice: '' }))
      calcLossAmount(0)
    } else if (val >= 0) {
      setPnLParams((v) => ({ ...v, SLPrice: val }))
      calcLossAmount(val)
    }
  }

  const onChangeTPPrice = (val: any) => {
    if (val === '') {
      setPnLParams((v) => ({ ...v, TPPrice: '' }))
      calcProfitAmount(0)
    } else if (val >= 0) {
      setPnLParams((v) => ({ ...v, TPPrice: val }))
      calcProfitAmount(val)
    }
  }

  useEffect(() => {
    if (data && visible) {
      const { takeProfitPrice, stopLossPrice } = data // '--'

      if (takeProfitPrice > 0) {
        calcProfitAmount(takeProfitPrice)
        setPnLParams((v) => ({ ...v, TPPrice: takeProfitPrice }))
      }
      if (stopLossPrice > 0) {
        calcLossAmount(stopLossPrice)
        setPnLParams((v) => ({ ...v, SLPrice: stopLossPrice }))
      }
    }
  }, [visible])

  useEffect(() => {
    if (!visible) {
      setPnLParams(initPnLParams)
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
                <strong>{data?.name}</strong>
                <MultipleStatus direction={PositionSideTypes[data?.side] as any} />
              </h4>
            </header>
            <section className="web-trade-dialog-position-info-data">
              <BalanceShow value={tokenSpotPrice} unit="" decimal={Number(tokenSpotPrice) === 0 ? 2 : data.decimals} />
              <span className={Number(memoChangeRate) >= 0 ? 'buy' : 'sell'}>{keepDecimals(memoChangeRate, 2)}%</span>
            </section>
            <section className="web-trade-dialog-position-info-count">
              <p>
                {t('Trade.TPSL.PositionAveragePrice', 'Position Average Price')} :{' '}
                <em>
                  {keepDecimals(data?.averagePrice ?? 0, Number(data?.averagePrice ?? 0) === 0 ? 2 : data.decimals)}
                </em>{' '}
                {VALUATION_TOKEN_SYMBOL}
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
                value={pnlParams.TPPrice}
                onChange={onChangeTPPrice}
                suffix={VALUATION_TOKEN_SYMBOL}
                type="number"
              />
              <p>
                {t('Trade.TPSL.TakeProfitTip1', 'When market price reaches')}{' '}
                <strong>{showPrice(pnlParams.TPPrice)}</strong> {VALUATION_TOKEN_SYMBOL},
                {t(
                  'Trade.TPSL.TakeProfitTip2',
                  'it will trigger Take Profit order to close this position. Estimated profit will be'
                )}{' '}
                <em className={Number(pnlParams.TPAmount) > 0 ? 'buy' : 'sell'}>{takeProfitGain}</em>{' '}
                {marginToken.symbol}.
              </p>
            </section>
            <header>
              <label>{t('Trade.TPSL.StopLoss', 'Stop Loss')}</label>
              {memoStopLoss}
            </header>
            <section>
              <Input
                value={pnlParams.SLPrice}
                onChange={onChangeSLPrice}
                suffix={VALUATION_TOKEN_SYMBOL}
                type="number"
              />
              <p>
                {t('Trade.TPSL.StopLossTip1', 'When market price reaches')}{' '}
                <strong>{showPrice(pnlParams.SLPrice)}</strong> {VALUATION_TOKEN_SYMBOL},
                {t(
                  'Trade.TPSL.StopLossTip2',
                  'it will trigger Stop Loss order to close this position. Estimated loss will be'
                )}{' '}
                <em className={Number(pnlParams.SLAmount) > 0 ? 'buy' : 'sell'}>{stopLossGain}</em> {marginToken.symbol}
                .
              </p>
            </section>
          </div>
        </div>
        <Button onClick={onConfirm}>{t('Trade.ClosePosition.Confirm', 'Confirm')}</Button>
      </div>
    </Dialog>
  )
}

export default TakeProfitAndStopLoss
