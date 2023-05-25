import React, { FC, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import QuestionPopover from '@/components/common/QuestionPopover'
import MultipleStatus from '@/components/web/MultipleStatus'
import { calcChangeFee, calcTradingFee } from '@/funcs/helper'
import { reducer, stateInit } from '@/reducers/opening'
import {
  useMarginTokenStore,
  useTokenSpotPricesStore,
  useProtocolConfigStore,
  useDerivativeListStore,
  usePositionOperationStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { PositionSideTypes } from '@/typings'
import { isGT, keepDecimals } from '@/utils/tools'

interface Props {
  data?: Record<string, any>
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: () => void
}

const PositionClose: FC<Props> = ({ data, loading, visible, onClose, onClick }) => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const closingType = usePositionOperationStore((state) => state.closingType)
  const closingAmount = usePositionOperationStore((state) => state.closingAmount)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[data?.derivative] ?? '0'
  }, [tokenSpotPrices])

  const calcTFeeFunc = async () => {
    const derivative = derAddressList?.[data?.derivative]?.derivative ?? ''
    const fee = await calcTradingFee(derivative, closingType, closingAmount)
    dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: true, value: fee } })
  }

  const calcCFeeFunc = async () => {
    const exchange = protocolConfig?.exchange ?? ''
    const derivative = derAddressList?.[data?.derivative]?.derivative ?? ''

    const fee = await calcChangeFee(data?.side, closingType, closingAmount, spotPrice, exchange, derivative)

    dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: true, value: fee } })
  }

  useEffect(() => {
    if (!visible) {
      dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: false, value: 0 } })
      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: false, value: 0 } })
    }
  }, [visible])

  useEffect(() => {
    if (visible && spotPrice && isGT(closingAmount, 0) && derAddressList && protocolConfig) {
      void calcTFeeFunc()
      void calcCFeeFunc()
    }
  }, [visible, spotPrice, closingAmount, derAddressList])

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
                <strong>{data?.derivative}</strong>
                <MultipleStatus multiple={data?.leverage} direction={PositionSideTypes[data?.side] as any} />
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
                <em>{keepDecimals(closingAmount, 2)}</em>
                <u>{closingType}</u>
              </dd>
            </dl>
            <dl>
              <dt>
                {t('Trade.ClosePosition.PCFEstimate', 'PCF')}
                <QuestionPopover size="mini" text={t('Trade.ClosePosition.PCFEstimateTip', 'PCF')} />
              </dt>
              <dd>
                {!state.posChangeFee.loaded ? (
                  <small>calculating...</small>
                ) : (
                  <>
                    <em>{keepDecimals(state.posChangeFee.value, 2)}</em>
                    <u>{marginToken.symbol}</u>
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
                {!state.tradingFeeInfo.loaded ? (
                  <small>calculating...</small>
                ) : (
                  <>
                    <em>-{keepDecimals(state.tradingFeeInfo.value, 2)}</em>
                    <u>{marginToken.symbol}</u>
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

export default PositionClose
