import PubSub from 'pubsub-js'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo, useReducer } from 'react'

import { findToken } from '@/config/tokens'
import { useBrokerInfo } from '@/zustand/useBrokerInfo'
import { isOpeningMinLimit } from '@/hooks/helper'
import { reducer, stateInit } from '@/reducers/openingPosition'
import { isET, isGT, isLT, isLTET } from '@/utils/tools'
import { useProtocolConf, useSpotPrice } from '@/hooks/useMatchConf'
import { OpeningType, useCalcOpeningDAT } from '@/zustand/useCalcOpeningDAT'
import { PubSubEvents, PositionSideTypes } from '@/typings'
import { useMTokenFromRoute, useOpeningPosition } from '@/hooks/useTrading'
import { useConfigInfo, usePairsInfo, useQuoteToken } from '@/zustand'

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

  const indicators = usePairsInfo((state) => state.indicators)
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const openingType = useCalcOpeningDAT((state) => state.openingType)
  const leverageNow = useCalcOpeningDAT((state) => state.leverageNow)
  const openingPrice = useCalcOpeningDAT((state) => state.openingPrice)
  const mTokenPrices = useConfigInfo((state) => state.mTokenPrices)
  const openingMinLimit = useConfigInfo((state) => state.openingMinLimit)
  const maxVolumeLoaded = useCalcOpeningDAT((state) => state.maxVolumeLoaded)
  const updateLeverageNow = useCalcOpeningDAT((state) => state.updateLeverageNow)
  const updateOpeningType = useCalcOpeningDAT((state) => state.updateOpeningType)
  const updateOpeningPrice = useCalcOpeningDAT((state) => state.updateOpeningPrice)

  const { marginToken } = useMTokenFromRoute()

  const { opening } = useOpeningPosition()
  const { spotPrice } = useSpotPrice(quoteToken, marginToken)
  const { protocolConfig } = useProtocolConf(quoteToken, marginToken)

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

      const status = await opening(
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
        window.toast.error(t('Trade.Bench.MinNumber', '', { Limit: openingMinLimit[marginToken], Token: marginToken }))
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
                  {memoLongPosApy}%<u>APR</u>
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
                  {memoShortPosApy}%<u>APR</u>
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
                    {memo2WayPosApy}%<u>APR</u>
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
