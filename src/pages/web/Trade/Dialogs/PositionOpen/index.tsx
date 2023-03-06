import { useTranslation } from 'react-i18next'
import { isEmpty, debounce } from 'lodash'
import React, { FC, useCallback, useEffect, useReducer } from 'react'

import { findToken } from '@/config/tokens'
import { keepDecimals } from '@/utils/tools'
import { PositionSideTypes } from '@/typings'
import { useMatchConf } from '@/hooks/useMatchConf'
import { reducer, stateInit } from '@/reducers/openingPosition'
import { calcChangeFee, calcTradingFee, checkOpeningVol } from '@/hooks/helper'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'
import QuestionPopover from '@/components/common/QuestionPopover'

interface Props {
  data: Record<string, any>
  visible: boolean
  onClose: () => void
  onClick: (amount: number) => void
}

const PositionOpen: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()

  const { spotPrice, marginToken, quoteToken, protocolConfig, factoryConfig, openingMaxLimit } = useMatchConf()

  const checkOpeningVolFunc = async () => {
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
      1000
    ),
    []
  )

  useEffect(() => {
    if (!isEmpty(data) && visible) {
      void checkOpeningVolFunc()
    }
  }, [data, visible])

  useEffect(() => {
    if (!visible) {
      dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: false, value: 0 } })
      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: false, value: 0 } })
    }
  }, [visible])

  useEffect(() => {
    if (visible && state.validOpeningVol && protocolConfig && factoryConfig && spotPrice) {
      void calcTFeeFunc(state.validOpeningVol.value, data.symbol, spotPrice, factoryConfig)
      void calcCFeeFunc(
        data?.side,
        state.validOpeningVol.value,
        data?.symbol,
        spotPrice,
        factoryConfig,
        protocolConfig.exchange
      )
    }
  }, [visible, spotPrice, factoryConfig, protocolConfig, state.validOpeningVol])

  return (
    <Dialog width="540px" visible={visible} title={t('Trade.COP.OpenPosition', 'Open Position')} onClose={onClose}>
      <div className="web-trade-dialog web-trade-dialog-position-close">
        <div className="web-trade-dialog-body">
          <div className="web-trade-dialog-position-info">
            <header className="web-trade-dialog-position-info-header">
              <h4>
                <strong>
                  {quoteToken}
                  {marginToken}
                </strong>
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
                        <em>{keepDecimals(state.validOpeningVol.value / 2, findToken(data?.symbol).decimals)}</em>
                        <u>{data?.symbol}</u>
                      </aside>
                      <aside>
                        <MultipleStatus direction="Short" />
                        <em>{keepDecimals(state.validOpeningVol.value / 2, findToken(data?.symbol).decimals)}</em>
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
                      <em>{keepDecimals(state.validOpeningVol.value, findToken(data?.symbol).decimals)}</em>
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
                    <em>{keepDecimals(state.posChangeFee.value, findToken(marginToken).decimals)}</em>
                    <u>{marginToken}</u>
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
                    <em>-{keepDecimals(state.tradingFeeInfo.value, findToken(marginToken).decimals)}</em>
                    <u>{marginToken}</u>
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
