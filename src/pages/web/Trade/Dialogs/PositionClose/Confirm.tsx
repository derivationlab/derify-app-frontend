import classNames from 'classnames'
import { isEmpty, debounce } from 'lodash'

import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import QuestionPopover from '@/components/common/QuestionPopover'
import MultipleStatus from '@/components/web/MultipleStatus'
import { calcChangeFee, calcTradingFee, checkClosingLimit } from '@/funcs/helper'
import { useMarginPrice } from '@/hooks/useMarginPrice'
import { usePositionLimit } from '@/hooks/usePositionLimit'
import { reducer, stateInit } from '@/reducers/opening'
import {
  useMarginTokenStore,
  useTokenSpotPricesStore,
  useProtocolConfigStore,
  useDerivativeListStore,
  usePositionOperationStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { PositionSideTypes, Rec } from '@/typings'
import { isGT, keepDecimals } from '@/utils/tools'

interface Props {
  data: Record<string, any>
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: () => void
}

const PositionClose: FC<Props> = ({ data, loading, visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, stateInit)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const openingParams = usePositionOperationStore((state) => state.openingParams)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)
  const { positionLimit } = usePositionLimit(protocolConfig?.exchange, data.token)
  const { data: marginPrice } = useMarginPrice(protocolConfig?.priceFeed)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[data?.derivative] ?? '0'
  }, [tokenSpotPrices])

  const _checkClosingLimit = async (positionLimit: Rec) => {
    // console.info(positionLimit, spotPrice)
    const [maximum, isGreater, effective] = checkClosingLimit(
      spotPrice,
      openingParams.closingAmount,
      positionLimit[data.token][PositionSideTypes[data.side]]
    )

    dispatch({ type: 'SET_POSITION_LIMITS', payload: { loaded: true, value: effective, maximum, isGreater } })
  }

  const calcTFeeFunc = useCallback(
    debounce(async (derivative: string, closingAmount: string) => {
      const fee = await calcTradingFee(derivative, closingAmount)
      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: true, value: fee } })
    }, 1000),
    []
  )

  const calcCFeeFunc = useCallback(
    debounce(
      async (derivative: string, exchange: string, spotPrice: string, marginPrice: string, closingAmount: string) => {
        const fee = await calcChangeFee(data?.side, closingAmount, spotPrice, marginPrice, exchange, derivative)

        dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: true, value: fee } })
      },
      1000
    ),
    []
  )

  useEffect(() => {
    if (!visible) {
      dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: false, value: 0 } })
      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: false, value: 0 } })
    }
  }, [visible])

  useEffect(() => {
    if (
      !isEmpty(data) &&
      visible &&
      positionLimit &&
      Number(openingParams.closingAmount) > 0 &&
      Number(spotPrice) > 0
    ) {
      void _checkClosingLimit(positionLimit)
    }
  }, [data, visible, spotPrice, positionLimit, openingParams.closingAmount])

  useEffect(() => {
    if (
      visible &&
      spotPrice &&
      isGT(marginPrice, 0) &&
      isGT(openingParams.closingAmount, 0) &&
      derAddressList &&
      protocolConfig
    ) {
      const exchange = protocolConfig.exchange
      const derivative = derAddressList[data.derivative]?.derivative ?? ''
      void calcTFeeFunc(derivative, state.positionLimits.value)
      void calcCFeeFunc(derivative, exchange, spotPrice, marginPrice, state.positionLimits.value)
    }
  }, [visible, spotPrice, marginPrice, derAddressList, state.positionLimits])

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
                {!state.positionLimits.loaded ? (
                  <small>loading...</small>
                ) : (
                  <span className={classNames({ error: state.positionLimits.isGreater })}>
                    <em>{keepDecimals(state.positionLimits.value, marginToken.decimals)}</em>
                    <u>{marginToken.symbol}</u>
                  </span>
                )}
                {state.positionLimits.isGreater && (
                  <QuestionPopover
                    size="mini"
                    icon="icon/warning.svg"
                    text={t('Trade.Bench.TheMaximumPositionValue', {
                      Amount: `${keepDecimals(state.positionLimits.maximum, marginToken.decimals)} ${
                        marginToken.symbol
                      }`
                    })}
                  />
                )}
              </dd>
            </dl>
            <dl>
              <dt>
                {t('Trade.ClosePosition.PCFEstimate', 'PCF')}
                <QuestionPopover size="mini" text={t('Trade.ClosePosition.PCFEstimateTip', 'PCF')} />
              </dt>
              <dd>
                {!state.posChangeFee.loaded ? (
                  <small>loading...</small>
                ) : (
                  <>
                    <em>{keepDecimals(state.posChangeFee.value, marginToken.decimals)}</em>
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
                  <small>loading...</small>
                ) : (
                  <>
                    <em>-{keepDecimals(state.tradingFeeInfo.value, marginToken.decimals)}</em>
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
