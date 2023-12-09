import classNames from 'classnames'
import { isEmpty, debounce } from 'lodash-es'

import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'
import { calcChangeFee, calcTradingFee, checkOpeningLimit } from '@/funcs/helper'
import { useMarginPrice } from '@/hooks/useMarginPrice'
import { useOpeningMaxLimit } from '@/hooks/useOpeningMaxLimit'
import { useTokenSpotPrice } from '@/hooks/useTokenSpotPrices'
import { reducer, stateInit } from '@/reducers/opening'
import { useMarginTokenStore, useProtocolConfigStore, useQuoteTokenStore, useTokenSpotPricesStore } from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { PositionSideTypes, Rec } from '@/typings'
import { bnDiv, keepDecimals, numeralNumber } from '@/utils/tools'

interface Props {
  data: Record<string, any>
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const PositionOpen: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const [state, dispatch] = useReducer(reducer, stateInit)
  const { t } = useTranslation()
  const spotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPricesForTrading)
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const { spotPrice } = useTokenSpotPrice(spotPrices, quoteToken.name)
  const { openingMaxLimit } = useOpeningMaxLimit(protocolConfig?.exchange, quoteToken)
  const { data: marginPrice } = useMarginPrice(protocolConfig?.priceFeed)

  const disabled = useMemo(
    () => !marginToken.open || (Number(state.positionLimits.maximum) === 0 && state.positionLimits.isGreater),
    [marginToken, state.positionLimits]
  )

  const _checkOpeningLimit = async (params: Rec) => {
    const [maximum, isGreater, effective] = checkOpeningLimit(
      spotPrice,
      data.volume,
      data.side,
      data.openType,
      params[quoteToken.token][PositionSideTypes[data.side]]
    )
    dispatch({ type: 'SET_POSITION_LIMITS', payload: { loaded: true, value: effective, maximum, isGreater } })
  }

  const calcTFeeFunc = useCallback(
    debounce(async (value: string, symbol: string, spotPrice: string, derivative: string) => {
      const fee = await calcTradingFee(derivative, value)

      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: true, value: fee } })
    }, 1000),
    []
  )

  const calcCFeeFunc = useCallback(
    debounce(
      async (
        side: PositionSideTypes,
        value: string,
        symbol: string,
        spotPrice: string,
        marginPrice: string,
        factoryConfig: string,
        protocolConfig: string
      ) => {
        const fee = await calcChangeFee(side, value, spotPrice, marginPrice, protocolConfig, factoryConfig, true)

        dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: true, value: fee } })
      },
      1000
    ),
    []
  )

  useEffect(() => {
    if (!isEmpty(data) && visible && openingMaxLimit && Number(spotPrice) > 0) {
      void _checkOpeningLimit(openingMaxLimit)
    }
  }, [data, visible, spotPrice, openingMaxLimit])

  useEffect(() => {
    if (!visible) {
      dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: false, value: 0 } })
      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: false, value: 0 } })
    }
  }, [visible])

  useEffect(() => {
    if (visible && state.positionLimits && protocolConfig && spotPrice) {
      const derivative = quoteToken.derivative
      void calcTFeeFunc(state.positionLimits.value, data.symbol, spotPrice, derivative)
      void calcCFeeFunc(
        data?.side,
        state.positionLimits.value,
        data?.symbol,
        spotPrice,
        marginPrice,
        derivative,
        protocolConfig.exchange
      )
    }
  }, [visible, protocolConfig, state.positionLimits, spotPrice, marginPrice])

  return (
    <Dialog width="540px" visible={visible} title={t('Trade.COP.OpenPosition', 'Open Position')} onClose={onClose}>
      <div className="web-trade-dialog web-trade-dialog-position-close">
        <div className="web-trade-dialog-body">
          <div className="web-trade-dialog-position-info">
            <header className="web-trade-dialog-position-info-header">
              <h4>
                <strong>{quoteToken.name}</strong>
                <MultipleStatus multiple={data?.leverage} direction={PositionSideTypes[data?.side] as any} />
              </h4>
            </header>
            <section className="web-trade-dialog-position-info-data">
              {data?.openType === 0 ? (
                <strong>{t('Trade.COP.MarketPrice', 'Market Price')}</strong>
              ) : (
                <p>
                  <BalanceShow
                    value={keepDecimals(data?.price, quoteToken.decimals)}
                    decimal={Number(data?.price) === 0 ? 2 : quoteToken.decimals}
                  />
                  <em>{t('Trade.Bench.LimitPrice', 'Limit Price')}</em>
                </p>
              )}
            </section>
          </div>
          <div className="web-trade-dialog-position-confirm">
            <dl>
              <dt>{t('Trade.COP.Volume', 'Volume')}</dt>
              {data?.side === PositionSideTypes.twoWay ? (
                <dd>
                  {!state.positionLimits.loaded ? (
                    <small>loading...</small>
                  ) : (
                    <section>
                      <aside>
                        <MultipleStatus direction="Long" />
                        <em>{numeralNumber(bnDiv(state.positionLimits.value, 2), marginToken.decimals)}</em>
                        <u>{data?.symbol}</u>
                      </aside>
                      <aside>
                        <MultipleStatus direction="Short" />
                        <em>{numeralNumber(bnDiv(state.positionLimits.value, 2), marginToken.decimals)}</em>
                        <u>{data?.symbol}</u>
                      </aside>
                    </section>
                  )}
                </dd>
              ) : (
                <dd>
                  {!state.positionLimits.loaded ? (
                    <small>loading...</small>
                  ) : (
                    <span className={classNames({ error: state.positionLimits.isGreater })}>
                      <em>{numeralNumber(state.positionLimits.value, marginToken.decimals)}</em>
                      <u>{data?.symbol}</u>
                    </span>
                  )}
                  {state.positionLimits.isGreater && (
                    <QuestionPopover
                      size="mini"
                      icon="icon/warning.svg"
                      text={t('Trade.Bench.TheMaximumPositionValue', {
                        Amount: `${numeralNumber(state.positionLimits.maximum, marginToken.decimals)} ${
                          marginToken.symbol
                        }`
                      })}
                    />
                  )}
                </dd>
              )}
              {/*{state.positionLimits.isGreater && (<small className='error'>*/}
              {/*  <Trans>{t('Trade.Bench.TheMaximumPositionValue',*/}
              {/*    { Amount: `${keepDecimals(state.positionLimits.maximum, 2)} ${marginToken.symbol}` })*/}
              {/*  }</Trans></small>)}*/}
            </dl>
            <dl>
              <dt>
                {t('Trade.COP.PCFEstimate', 'PCF(Estimate)')}
                <QuestionPopover size="mini" text={t('Trade.COP.PCFEstimateTip', 'PCF(Estimate)')} />
              </dt>
              <dd>
                {!state.posChangeFee.loaded ? (
                  <small>loading...</small>
                ) : (
                  <div>
                    <em>{numeralNumber(state.posChangeFee.value, marginToken.decimals)}</em>
                    <u>{marginToken.symbol}</u>
                  </div>
                )}
              </dd>
            </dl>
            <dl>
              <dt>
                {t('Trade.COP.TradingFee', 'Trading Fee')}
                <QuestionPopover
                  size="mini"
                  text={t('Trade.COP.TradingFeeTip', 'Trading Fee=Trading volume*Trading Fee Rate')}
                />
              </dt>
              <dd>
                {!state.tradingFeeInfo.loaded ? (
                  <small>loading...</small>
                ) : (
                  <div>
                    <em>-{numeralNumber(state.tradingFeeInfo.value, marginToken.decimals)}</em>
                    <u>{marginToken.symbol}</u>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        <Button onClick={() => onClick(state.positionLimits.value)} disabled={disabled}>
          {t('Trade.COP.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default PositionOpen
