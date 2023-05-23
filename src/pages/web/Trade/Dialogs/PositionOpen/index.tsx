import { isEmpty, debounce } from 'lodash'

import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'
import { calcChangeFee, calcTradingFee, checkOpeningVol } from '@/funcs/helper'
import { reducer, stateInit } from '@/reducers/opening'
import {
  useDerivativeListStore,
  useMarginTokenStore,
  useOpeningMaxLimitStore,
  useProtocolConfigStore,
  useQuoteTokenStore,
  useTokenSpotPricesStore
} from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { PositionSideTypes, Rec } from '@/typings'
import { keepDecimals } from '@/utils/tools'

interface Props {
  data: Record<string, any>
  visible: boolean
  onClose: () => void
  onClick: (amount: number) => void
}

const PositionOpen: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()

  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)
  const openingMaxLimit = useOpeningMaxLimitStore((state) => state.openingMaxLimit)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[quoteToken.symbol] ?? '0'
  }, [quoteToken, tokenSpotPrices])

  const _checkOpeningVol = async (openingMaxLimit: Rec) => {
    const volume = checkOpeningVol(
      spotPrice,
      data.volume,
      data.side,
      data.openType,
      data.symbol,
      openingMaxLimit[data.side]
    )

    dispatch({ type: 'SET_VALID_OPENING_VOLUME', payload: { loaded: true, value: volume } })
  }

  const calcTFeeFunc = useCallback(
    debounce(async (value: number, symbol: string, spotPrice: string, factoryConfig: string) => {
      const fee = await calcTradingFee(factoryConfig, symbol, value, spotPrice)

      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: true, value: fee } })
    }, 1000),
    []
  )

  const calcCFeeFunc = useCallback(
    debounce(
      async (
        side: PositionSideTypes,
        value: number,
        symbol: string,
        spotPrice: string,
        factoryConfig: string,
        protocolConfig: string
      ) => {
        const fee = await calcChangeFee(side, symbol, value, spotPrice, protocolConfig, factoryConfig, true)

        dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: true, value: fee } })
      },
      500
    ),
    []
  )

  useEffect(() => {
    if (!isEmpty(data) && visible && openingMaxLimit) {
      void _checkOpeningVol(openingMaxLimit)
    }
  }, [data, visible])

  useEffect(() => {
    if (!visible) {
      dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: false, value: 0 } })
      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: false, value: 0 } })
    }
  }, [visible])

  useEffect(() => {
    if (visible && state.validOpeningVol && protocolConfig && derAddressList && spotPrice) {
      const derivative = derAddressList[quoteToken.symbol].derivative
      void calcTFeeFunc(state.validOpeningVol.value, data.symbol, spotPrice, derivative)
      void calcCFeeFunc(
        data?.side,
        state.validOpeningVol.value,
        data?.symbol,
        spotPrice,
        derivative,
        protocolConfig.exchange
      )
    }
  }, [visible, derAddressList, protocolConfig, state.validOpeningVol, spotPrice])

  return (
    <Dialog width="540px" visible={visible} title={t('Trade.COP.OpenPosition', 'Open Position')} onClose={onClose}>
      <div className="web-trade-dialog web-trade-dialog-position-close">
        <div className="web-trade-dialog-body">
          <div className="web-trade-dialog-position-info">
            <header className="web-trade-dialog-position-info-header">
              <h4>
                <strong>{quoteToken.symbol}</strong>
                <MultipleStatus multiple={data?.leverage} direction={PositionSideTypes[data?.side] as any} />
              </h4>
            </header>
            <section className="web-trade-dialog-position-info-data">
              {data?.openType === 0 ? (
                <strong>{t('Trade.COP.MarketPrice', 'Market Price')}</strong>
              ) : (
                <p>
                  <BalanceShow value={data?.price} unit="" />
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
                  {!state.validOpeningVol.loaded ? (
                    <small>calculating...</small>
                  ) : (
                    <section>
                      <aside>
                        <MultipleStatus direction="Long" />
                        <em>{keepDecimals(state.validOpeningVol.value / 2, 2)}</em>
                        <u>{data?.symbol}</u>
                      </aside>
                      <aside>
                        <MultipleStatus direction="Short" />
                        <em>{keepDecimals(state.validOpeningVol.value / 2, 2)}</em>
                        <u>{data?.symbol}</u>
                      </aside>
                    </section>
                  )}
                </dd>
              ) : (
                <dd>
                  {!state.validOpeningVol.loaded ? (
                    <small>calculating...</small>
                  ) : (
                    <span>
                      <em>{keepDecimals(state.validOpeningVol.value, 2)}</em>
                      <u>{data?.symbol}</u>
                    </span>
                  )}
                </dd>
              )}
            </dl>
            <dl>
              <dt>
                {t('Trade.COP.PCFEstimate', 'PCF(Estimate)')}
                <QuestionPopover size="mini" text={t('Trade.COP.PCFEstimateTip', 'PCF(Estimate)')} />
              </dt>
              <dd>
                {!state.posChangeFee.loaded ? (
                  <small>calculating...</small>
                ) : (
                  <div>
                    <em>{keepDecimals(state.posChangeFee.value, 2)}</em>
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
                  <small>calculating...</small>
                ) : (
                  <div>
                    <em>-{keepDecimals(state.tradingFeeInfo.value, 2)}</em>
                    <u>{marginToken.symbol}</u>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        <Button onClick={() => onClick(state.validOpeningVol.value)}>{t('Trade.COP.Confirm', 'Confirm')}</Button>
      </div>
    </Dialog>
  )
}

PositionOpen.defaultProps = {}

export default PositionOpen
