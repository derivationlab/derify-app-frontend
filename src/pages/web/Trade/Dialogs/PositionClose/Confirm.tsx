import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'

import Trader from '@/class/Trader'
import { PositionSide } from '@/store/contract/helper'
import { useShareMessage } from '@/store/share/hooks'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import MultipleStatus from '@/components/web/MultipleStatus'
import QuestionPopover from '@/components/common/QuestionPopover'

interface Props {
  data?: Record<string, any>
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: () => void
}

const PositionClose: FC<Props> = ({ data, loading, visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { shareMessage } = useShareMessage()
  const { calcClosePositionTradingFee, calcClosePositionChangeFee } = Trader

  const [tradingFee, setTradingFee] = useState<string>('0')
  const [changeFee, setChangeFee] = useState<string>('0')
  const [changeFeeCalculating, setChangeFeeCalculating] = useState<boolean>(true)
  const [tradingFeeCalculating, setTradingFeeCalculating] = useState<boolean>(true)

  const memoShareMessage = useMemo(() => {
    if (visible && !isEmpty(shareMessage) && shareMessage?.type === 'CLOSE_POSITION') {
      return shareMessage
    }
    return {}
  }, [shareMessage, visible])

  const calcClosePositionTradingFeeCb = useCallback(async () => {
    setTradingFeeCalculating(true)

    const fee = await calcClosePositionTradingFee(
      memoShareMessage?.symbol,
      data?.token,
      memoShareMessage?.amount,
      data?.spotPrice
    )

    setTradingFee(fee)
    setTradingFeeCalculating(false)
  }, [memoShareMessage?.symbol, data?.token, memoShareMessage?.amount, data?.spotPrice])

  const calcClosePositionChangeFeeCb = useCallback(async () => {
    setChangeFeeCalculating(true)

    const fee = await calcClosePositionChangeFee(
      data?.side,
      memoShareMessage?.symbol,
      data?.token,
      memoShareMessage?.amount,
      data?.spotPrice
    )

    setChangeFee(fee)
    setChangeFeeCalculating(false)
  }, [data?.spotPrice, memoShareMessage?.symbol, memoShareMessage?.amount, data?.side, data?.token])

  useEffect(() => {
    if (!isEmpty(memoShareMessage)) {
      void calcClosePositionTradingFeeCb()
      void calcClosePositionChangeFeeCb()
    }
  }, [memoShareMessage])

  useEffect(() => {
    if (!visible) {
      setTradingFee('0')
      setChangeFee('0')
    }
  }, [visible])

  return (
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
              <strong>{t('Trade.COP.MarketPrice', 'Market Price')}</strong>
            </section>
          </div>
          <div className="web-trade-dialog-position-confirm">
            <dl>
              <dt>{t('Trade.ClosePosition.Volume', 'Volume')}</dt>
              <dd>
                <em>{memoShareMessage?.amount}</em>
                <u>{memoShareMessage?.symbol}</u>
              </dd>
            </dl>
            <dl>
              <dt>
                {t('Trade.ClosePosition.PCFEstimate', 'PCF')}
                <QuestionPopover size="mini" text={t('Trade.ClosePosition.PCFEstimateTip', 'PCF')} />
              </dt>
              <dd>
                {changeFeeCalculating ? (
                  <small>calculating...</small>
                ) : (
                  <>
                    <em>{changeFee}</em>
                    <u>{BASE_TOKEN_SYMBOL}</u>
                  </>
                )}
              </dd>
            </dl>
            <dl>
              <dt>
                {t('Trade.ClosePosition.TradingFee', 'Trading Fee')}
                <QuestionPopover
                  size="mini"
                  text={t('Trade.ClosePosition.TradingFeeTip', 'Trading Fee=Trading volume*Trading Fee Rate')}
                />
              </dt>
              <dd>
                {tradingFeeCalculating ? (
                  <small>calculating...</small>
                ) : (
                  <>
                    <em>-{tradingFee}</em>
                    <u>{BASE_TOKEN_SYMBOL}</u>
                  </>
                )}
              </dd>
            </dl>
          </div>
        </div>
        <Button onClick={onClick} loading={loading}>
          {t('Trade.ClosePosition.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

PositionClose.defaultProps = {}

export default PositionClose
