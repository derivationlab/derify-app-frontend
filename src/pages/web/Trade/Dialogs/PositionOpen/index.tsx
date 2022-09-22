import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isEmpty } from 'lodash'
import BN from 'bignumber.js'

import Trader from '@/class/Trader'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { PositionSide } from '@/store/contract/helper'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'
import { nonBigNumberInterception } from '@/utils/tools'

interface Props {
  data: Record<string, any>
  visible: boolean
  onClose: () => void
  onClick: () => void
}

const PositionOpen: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { calcClosePositionTradingFee, calcClosePositionChangeFee, checkOpenPositionSize } = Trader

  const [changeFee, setChangeFee] = useState<string>('0')
  const [tradingFee, setTradingFee] = useState<string>('0')
  const [validVolume, setValidVolume] = useState<string>('0')
  const [changeFeeCalculating, setChangeFeeCalculating] = useState<boolean>(true)
  const [tradingFeeCalculating, setTradingFeeCalculating] = useState<boolean>(true)

  const calcClosePositionTradingFeeCb = useCallback(async () => {
    setTradingFeeCalculating(true)

    const fee = await calcClosePositionTradingFee(data?.symbol, data?.token, data?.volume, data?.price)

    setTradingFee(fee)
    setTradingFeeCalculating(false)
  }, [data])

  const calcClosePositionChangeFeeCb = useCallback(async () => {
    setChangeFeeCalculating(true)

    const fee = await calcClosePositionChangeFee(data?.side, data?.symbol, data?.token, data?.volume, data?.price, true)

    setChangeFee(new BN(fee).times(-1).toString())
    setChangeFeeCalculating(false)
  }, [data])

  const checkOpenPositionSizeFunc = async () => {
    const volume = await checkOpenPositionSize(data.token, data.side, data.symbol, data.openType, data.volume, data.price)
    console.info(volume)
    setValidVolume(volume)
  }

  // const memoApyValue = useMemo(() => {
  //   const apy = new BN(data?.apy).times(100)
  //   return apy.isLessThanOrEqualTo(0) ? '--' : String(apy)
  // }, [data?.apy])

  useEffect(() => {
    if (!isEmpty(data) && visible) {
      void checkOpenPositionSizeFunc()
      void calcClosePositionTradingFeeCb()
      void calcClosePositionChangeFeeCb()
    }
  }, [data, visible])

  useEffect(() => {
    if (!visible) {
      setTradingFee('0')
      setChangeFee('0')
    }
  }, [visible])

  return (
    <Dialog width='540px' visible={visible} title={t('Trade.COP.OpenPosition', 'Open Position')} onClose={onClose}>
      <div className='web-trade-dialog web-trade-dialog-position-close'>
        <div className='web-trade-dialog-body'>
          <div className='web-trade-dialog-position-info'>
            <header className='web-trade-dialog-position-info-header'>
              <h4>
                <strong>{data?.name}</strong>
                <MultipleStatus multiple={data?.leverage} direction={PositionSide[data?.side] as any} />
              </h4>
              {/*
              <p>
                <strong>{memoApyValue}%</strong> APY.
              </p>
              */}
            </header>
            <section className='web-trade-dialog-position-info-data'>
              {data?.openType === 0 ? (
                <strong>{t('Trade.COP.MarketPrice', 'Market Price')}</strong>
              ) : (
                <p>
                  <BalanceShow value={data?.price} unit='' />
                  <em>{t('Trade.Bench.LimitPrice', 'Limit Price')}</em>
                </p>
              )}
            </section>
          </div>
          <div className='web-trade-dialog-position-confirm'>
            <dl>
              <dt>{t('Trade.COP.Volume', 'Volume')}</dt>
              {data?.side === PositionSide['2-Way'] ? (
                <dd>
                  <section>
                    <aside>
                      <MultipleStatus direction='Long' />
                      <em>{nonBigNumberInterception(new BN(validVolume).div(2).toString())}</em>
                      <u>{data?.symbol}</u>
                    </aside>
                    <aside>
                      <MultipleStatus direction='Short' />
                      <em>{nonBigNumberInterception(new BN(validVolume).div(2).toString())}</em>
                      <u>{data?.symbol}</u>
                    </aside>
                  </section>
                </dd>
              ) : (
                <dd>
                  <span>
                    <em>{nonBigNumberInterception(validVolume)}</em>
                    <u>{data?.symbol}</u>
                  </span>
                </dd>
              )}
            </dl>
            <dl>
              <dt>
                {t('Trade.COP.PCFEstimate', 'PCF(Estimate)')}
                <QuestionPopover size='mini' text={t('Trade.COP.PCFEstimateTip', 'PCF(Estimate)')} />
              </dt>
              <dd>
                {changeFeeCalculating ? (
                  <small>calculating...</small>
                ) : (
                  <div>
                    <em>{changeFee}</em>
                    <u>{BASE_TOKEN_SYMBOL}</u>
                  </div>
                )}
              </dd>
            </dl>
            <dl>
              <dt>
                {t('Trade.COP.TradingFee', 'Trading Fee')}
                <QuestionPopover
                  size='mini'
                  text={t('Trade.COP.TradingFeeTip', 'Trading Fee=Trading volume*Trading Fee Rate')}
                />
              </dt>
              <dd>
                {tradingFeeCalculating ? (
                  <small>calculating...</small>
                ) : (
                  <div>
                    <em>-{tradingFee}</em>
                    <u>{BASE_TOKEN_SYMBOL}</u>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        <Button onClick={onClick}>{t('Trade.COP.Confirm', 'Confirm')}</Button>
      </div>
    </Dialog>
  )
}

PositionOpen.defaultProps = {}

export default PositionOpen
