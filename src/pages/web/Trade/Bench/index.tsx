import PubSub from 'pubsub-js'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo, useReducer } from 'react'

import { findToken } from '@/config/tokens'
import { isOpeningMinLimit } from '@/hooks/helper'
import { reducer, stateInit } from '@/reducers/opening'
import { usePositionOperation } from '@/hooks/useTrading'
import { PubSubEvents, PositionSideTypes } from '@/typings'
import { bnDiv, isET, isGT, isLT, isLTET, keepDecimals } from '@/utils/tools'
import { useIndicatorsConf, useProtocolConf, useSpotPrice } from '@/hooks/useMatchConf'
import {
  OpeningType,
  useOpeningStore,
  useQuoteTokenStore,
  useBrokerInfoStore,
  useConfigInfoStore,
  useMarginTokenStore
} from '@/store'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import PositionOpenDialog from '@/pages/web/Trade/Dialogs/PositionOpen'
import { LeverageSelect } from '@/components/common/Form'

import Row from './c/Row'
import Col from './c/Col'
import Info from './c/Info'
import PriceInput from './c/PriceInput'
import QuantityInput from './c/QuantityInput'
import OpenTypeSelect from './c/OpenTypeSelect'

const Bench: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()

  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const openingType = useOpeningStore((state) => state.openingType)
  const leverageNow = useOpeningStore((state) => state.leverageNow)
  const openingPrice = useOpeningStore((state) => state.openingPrice)
  const mTokenPrices = useConfigInfoStore((state) => state.mTokenPrices)
  const openingMinLimit = useConfigInfoStore((state) => state.openingMinLimit)
  const maxVolumeLoaded = useOpeningStore((state) => state.maxVolumeLoaded)
  const updateLeverageNow = useOpeningStore((state) => state.updateLeverageNow)
  const updateOpeningType = useOpeningStore((state) => state.updateOpeningType)
  const updateOpeningPrice = useOpeningStore((state) => state.updateOpeningPrice)

  const { spotPrice } = useSpotPrice(quoteToken, marginToken)
  const { indicators } = useIndicatorsConf(quoteToken)
  const { protocolConfig } = useProtocolConf(marginToken)
  const { increasePosition } = usePositionOperation()

  const memoLongPosApy = useMemo(() => {
    const p = Number(indicators?.longPmrRate)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [indicators])

  const memo2WayPosApy = useMemo(() => {
    const p1 = Number(indicators?.shortPmrRate)
    const p2 = Number(indicators?.longPmrRate)
    if (p1 >= 0 && p2 >= 0) {
      const apy = ((p1 + p2) / 2) * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [indicators])

  const memoShortPosApy = useMemo(() => {
    const p = Number(indicators?.shortPmrRate)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [indicators])

  const memoDisabled1 = useMemo(() => {
    return isLTET(Number(state.openingAmount), 0)
  }, [state.openingAmount])

  const memoDisabled2 = useMemo(() => {
    return isLTET(openingPrice, 0)
  }, [openingPrice])

  const isOrderConversion = (openType: OpeningType, price: string): boolean => {
    return openType === OpeningType.Limit ? isET(spotPrice, price) : false
  }

  const openPositionFunc = async (amount: number) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    dispatch({ type: 'SET_MODAL_STATUS', payload: false })

    if (brokerBound?.broker && protocolConfig) {
      const conversion = isOrderConversion(openingType, state.openingParams?.price)

      const status = await increasePosition(
        protocolConfig.exchange,
        brokerBound.broker,
        findToken(quoteToken).tokenAddress,
        state.openingParams?.side,
        openingType,
        state.openingParams?.symbol,
        state.openingParams?.price,
        leverageNow,
        amount,
        conversion
      )

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }
    } else {
      window.toast.error(t('common.failed', 'failed'))
      // failed
    }

    window.toast.dismiss(toast)
  }

  const openPositionDialog = async (side: PositionSideTypes) => {
    if (protocolConfig) {
      let _openType = openingType
      const _realPrice = openingType === OpeningType.Market ? spotPrice : openingPrice

      const isLimit = isOpeningMinLimit(
        mTokenPrices[marginToken],
        openingMinLimit[marginToken],
        state.openingAmount,
        state.tokenSelect,
        spotPrice
      )

      if (isLimit) {
        window.toast.error(
          t('Trade.Bench.TheMinimumPositionValue', {
            USD: openingMinLimit[marginToken],
            Token: marginToken,
            Margin: keepDecimals(
              bnDiv(openingMinLimit[marginToken], mTokenPrices[marginToken]),
              findToken(marginToken).decimals
            )
          })
        )
        return
      }

      if (openingType === OpeningType.Limit) {
        if (side === PositionSideTypes.long) {
          if (isGT(openingPrice, spotPrice)) _openType = 0
        }
        if (side === PositionSideTypes.short) {
          if (isLT(openingPrice, spotPrice)) _openType = 0
        }
      }

      const openPosParams = {
        side,
        price: _realPrice,
        symbol: state.tokenSelect,
        volume: state.openingAmount,
        leverage: leverageNow,
        openType: _openType
      }
      dispatch({ type: 'SET_MODAL_STATUS', payload: true })
      dispatch({ type: 'SET_OPENING_PARAMS', payload: openPosParams })
    }
  }

  useEffect(() => {
    if (isGT(spotPrice, 0)) {
      updateOpeningPrice(spotPrice)
    }
  }, [spotPrice])

  useEffect(() => {
    dispatch({ type: 'SET_TOKEN_SELECT', payload: marginToken })
  }, [marginToken])

  return (
    <>
      <div className="web-trade-bench">
        <Info />
        <div className="web-trade-bench-pane">
          <Row>
            <Col label={t('Trade.Bench.PriceType', 'Price Type')}>
              <OpenTypeSelect value={openingType} onChange={updateOpeningType} />
            </Col>
            <Col label={t('Trade.Bench.Leverage', 'Leverage')}>
              <LeverageSelect className="web-trade-bench-leverage" value={leverageNow} onChange={updateLeverageNow} />
            </Col>
          </Row>
          <Row>
            <Col label={t('Trade.Bench.Price', 'Price')}>
              <PriceInput
                value={openingPrice}
                onChange={(v) => updateOpeningPrice(v as any)}
                disabled={openingType === OpeningType.Market}
              />
            </Col>
          </Row>
          <QuantityInput
            type={state.tokenSelect}
            value={state.openingAmount}
            onChange={(val) => dispatch({ type: 'SET_OPENING_AMOUNT', payload: val })}
            onTypeChange={(val) => dispatch({ type: 'SET_TOKEN_SELECT', payload: val })}
          />
          <Row>
            <Col>
              <Button
                loading={!maxVolumeLoaded}
                noDisabledStyle
                className="web-trade-bench-button-short"
                onClick={() => openPositionDialog(PositionSideTypes.long)}
                type="buy"
              >
                <strong>{t('Trade.Bench.Long', 'Long')}</strong>
                <em>
                  {keepDecimals(memoLongPosApy, 2)}%<u>APR</u>
                </em>
              </Button>
            </Col>
            <Col>
              <Button
                loading={!maxVolumeLoaded}
                disabled={memoDisabled1 || memoDisabled2}
                noDisabledStyle
                className="web-trade-bench-button-short"
                onClick={() => openPositionDialog(PositionSideTypes.short)}
                type="sell"
              >
                <strong>{t('Trade.Bench.Short', 'Short')}</strong>
                <em>
                  {keepDecimals(memoShortPosApy, 2)}%<u>APR</u>
                </em>
              </Button>
            </Col>
          </Row>
          {openingType === OpeningType.Market && (
            <Row>
              <Col>
                <Button
                  loading={!maxVolumeLoaded}
                  disabled={memoDisabled1 || memoDisabled2}
                  noDisabledStyle
                  className="web-trade-bench-button-full"
                  onClick={() => openPositionDialog(PositionSideTypes.twoWay)}
                  outline
                  full
                  type="blue"
                >
                  <strong>{t('Trade.Bench.TowWay', '2-Way')}</strong>
                  <em>
                    {keepDecimals(memo2WayPosApy, 2)}%<u>APR</u>
                  </em>
                </Button>
              </Col>
            </Row>
          )}
        </div>
        <NotConnect />
      </div>
      <PositionOpenDialog
        data={state.openingParams}
        visible={state.modalStatus}
        onClose={() => dispatch({ type: 'SET_MODAL_STATUS', payload: false })}
        onClick={openPositionFunc}
      />
    </>
  )
}

export default Bench
