import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useReducer } from 'react'

import { useMatchConf } from '@/hooks/useMatchConf'
import { PositionSideTypes } from '@/typings'
import { useCalcOpeningDAT } from '@/zustand/useCalcOpeningDAT'
import { reducer, stateInit } from '@/reducers/openingPosition'
import { isGT, keepDecimals } from '@/utils/tools'
import { calcChangeFee, calcTradingFee } from '@/hooks/helper'
import { findToken, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'

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
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()

  const { spotPrice, factoryConfig, protocolConfig, marginToken } = useMatchConf()

  const closingType = useCalcOpeningDAT((state) => state.closingType)
  const closingAmount = useCalcOpeningDAT((state) => state.closingAmount)

  const calcTFeeFunc = useCallback(async () => {
    if (factoryConfig) {
      const fee = await calcTradingFee(factoryConfig, closingType, closingAmount, spotPrice)
      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: true, value: fee } })
    }
  }, [data, factoryConfig, spotPrice, closingAmount])

  const calcCFeeFunc = useCallback(async () => {
    if (factoryConfig && protocolConfig) {
      const fee = await calcChangeFee(
        data?.side,
        closingType,
        closingAmount,
        spotPrice,
        protocolConfig.exchange,
        factoryConfig
      )

      dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: true, value: fee } })
    }
  }, [data, spotPrice, factoryConfig, protocolConfig, closingAmount, closingType])

  useEffect(() => {
    if (!visible) {
      dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: false, value: 0 } })
      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: false, value: 0 } })
    }
  }, [visible])

  useEffect(() => {
    if (visible && isGT(closingAmount, 0)) {
      void calcTFeeFunc()
      void calcCFeeFunc()
    }
  }, [visible, closingAmount])

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
                <strong>{`${data?.quoteToken}${VALUATION_TOKEN_SYMBOL}`}</strong>
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
                <em>{keepDecimals(closingAmount, findToken(closingType).decimals)}</em>
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
                    <em>{keepDecimals(state.posChangeFee.value, findToken(marginToken).decimals)}</em>
                    <u>{marginToken}</u>
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
                    <em>-{keepDecimals(state.tradingFeeInfo.value, findToken(marginToken).decimals)}</em>
                    <u>{marginToken}</u>
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
