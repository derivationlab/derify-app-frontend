import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useReducer } from 'react'

import { PositionSide } from '@/store/contract/helper'
import { useMatchConf } from '@/hooks/useMatchConf'
import { reducer, stateInit } from '@/reducers/openingPosition'
import { nonBigNumberInterception } from '@/utils/tools'
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
  onClick: () => void
}

const PositionOpen: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const { t } = useTranslation()

  const [state, dispatch] = useReducer(reducer, stateInit)

  const { spotPrice, marginToken, quoteToken, protocolConfig, factoryConfig, openingMaxLimit } = useMatchConf()

  const calcTradingFeeFunc = useCallback(async () => {
    if (factoryConfig) {
      const fee = await calcTradingFee(factoryConfig, data?.symbol, state.validOpeningVol.value, spotPrice)
      // console.info(fee)
      dispatch({ type: 'SET_TRADING_FEE_INFO', payload: { loaded: true, value: fee } })
    }
  }, [data, factoryConfig, spotPrice, state.validOpeningVol])

  const calcChangeFeeFunc = useCallback(async () => {
    if (factoryConfig && protocolConfig) {
      const fee = await calcChangeFee(
        data?.side,
        data?.symbol,
        state.validOpeningVol.value,
        spotPrice,
        protocolConfig.exchange,
        factoryConfig,
        true
      )

      dispatch({ type: 'SET_CHANGE_FEE_INFO', payload: { loaded: true, value: fee } })
    }
  }, [data, spotPrice, factoryConfig, protocolConfig, state.validOpeningVol])

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
    if (visible && state.validOpeningVol.value) {
      void calcTradingFeeFunc()
      void calcChangeFeeFunc()
    }
  }, [visible, state.validOpeningVol])

  return (
    <Dialog width="540px" visible={visible} title={t('Trade.COP.OpenPosition', 'Open Position')} onClose={onClose}>
      <div className="web-trade-dialog web-trade-dialog-position-close">
        <div className="web-trade-dialog-body">
          <div className="web-trade-dialog-position-info">
            <header className="web-trade-dialog-position-info-header">
              <h4>
                <strong>
                  {quoteToken}-{marginToken}
                </strong>
                <MultipleStatus multiple={data?.leverage} direction={PositionSide[data?.side] as any} />
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
              {data?.side === PositionSide.twoWay ? (
                <dd>
                  {!state.validOpeningVol.loaded ? (
                    <small>calculating...</small>
                  ) : (
                    <section>
                      <aside>
                        <MultipleStatus direction="Long" />
                        <em>{nonBigNumberInterception(state.validOpeningVol.value / 2, 8)}</em>
                        <u>{data?.symbol}</u>
                      </aside>
                      <aside>
                        <MultipleStatus direction="Short" />
                        <em>{nonBigNumberInterception(state.validOpeningVol.value / 2, 8)}</em>
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
                      <em>{nonBigNumberInterception(state.validOpeningVol.value, 8)}</em>
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
                    <em>{nonBigNumberInterception(state.posChangeFee.value, 8)}</em>
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
                    <em>-{nonBigNumberInterception(state.tradingFeeInfo.value, 8)}</em>
                    <u>{marginToken}</u>
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
