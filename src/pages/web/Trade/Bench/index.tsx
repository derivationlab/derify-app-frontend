import PubSub from 'pubsub-js'

import React, { FC, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import LeverageSelect from '@/components/common/Form/LeverageSelect'
import NotConnect from '@/components/web/NotConnect'
import { isOpeningMinLimit } from '@/funcs/helper'
import { useMarginPrice } from '@/hooks/useMarginPrice'
import { usePositionOperation } from '@/hooks/useTrading'
import PositionOpenDialog from '@/pages/web/Trade/Dialogs/PositionOpen'
import { reducer, stateInit } from '@/reducers/opening'
import {
  usePositionOperationStore,
  useQuoteTokenStore,
  useBrokerInfoStore,
  useMarginTokenStore,
  useTokenSpotPricesStore,
  useMarginIndicatorsStore,
  useProtocolConfigStore
} from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { useOpeningMinLimitStore } from '@/store/useOpeningMinLimit'
import { PubSubEvents, PositionSideTypes, PositionOrderTypes } from '@/typings'
import { bnDiv, numeralNumber, isET, isGT, isLT, isLTET, keepDecimals } from '@/utils/tools'

import Col from './c/Col'
import Info from './c/Info'
import OpenTypeSelect from './c/OpenTypeSelect'
import PriceInput from './c/PriceInput'
import QuantityInput from './c/QuantityInput'
import Row from './c/Row'

const Bench: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { increasePosition } = usePositionOperation()

  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const openingType = usePositionOperationStore((state) => state.openingType)
  const leverageNow = usePositionOperationStore((state) => state.leverageNow)
  const openingPrice = usePositionOperationStore((state) => state.openingPrice)
  const updateLeverageNow = usePositionOperationStore((state) => state.updateLeverageNow)
  const updateOpeningType = usePositionOperationStore((state) => state.updateOpeningType)
  const updateOpeningPrice = usePositionOperationStore((state) => state.updateOpeningPrice)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)
  const openingMinLimit = useOpeningMinLimitStore((state) => state.openingMinLimit)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)

  const { data: marginPrice } = useMarginPrice(protocolConfig?.priceFeed)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[quoteToken.symbol] ?? '0'
  }, [quoteToken, tokenSpotPrices])

  const memoLongPosApy = useMemo(() => {
    const p = Number(marginIndicators?.[quoteToken.address]?.longPmrRate ?? 0)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [quoteToken, marginIndicators])

  const memo2WayPosApy = useMemo(() => {
    const p1 = Number(marginIndicators?.[quoteToken.address]?.shortPmrRate ?? 0)
    const p2 = Number(marginIndicators?.[quoteToken.address]?.longPmrRate ?? 0)
    if (p1 >= 0 && p2 >= 0) {
      const apy = ((p1 + p2) / 2) * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [quoteToken, marginIndicators])

  const memoShortPosApy = useMemo(() => {
    const p = Number(marginIndicators?.[quoteToken.address]?.shortPmrRate ?? 0)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [quoteToken, marginIndicators])

  const memoDisabled1 = useMemo(() => {
    return isLTET(Number(state.openingAmount), 0)
  }, [state.openingAmount])

  const memoDisabled2 = useMemo(() => {
    return isLTET(openingPrice, 0)
  }, [openingPrice])

  const isOrderConversion = (openType: PositionOrderTypes, price: string): boolean => {
    return openType === PositionOrderTypes.Limit ? isET(spotPrice, price) : false
  }

  const openPositionFunc = async (amount: number) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    dispatch({ type: 'SET_MODAL_STATUS', payload: false })

    if (brokerBound?.broker && protocolConfig) {
      const conversion = isOrderConversion(openingType, state.openingParams?.price)
      const { broker } = brokerBound
      const { address } = quoteToken
      const { exchange } = protocolConfig
      const { side, price, symbol } = state.openingParams
      const status = await increasePosition(
        exchange,
        broker,
        address,
        side,
        openingType,
        symbol,
        price,
        leverageNow,
        amount,
        conversion
      )

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
        PubSub.publish(PubSubEvents.UPDATE_TRADER_VARIABLES)
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
      const _realPrice = openingType === PositionOrderTypes.Market ? spotPrice : openingPrice

      const isLimit = isOpeningMinLimit(marginPrice, openingMinLimit, state.openingAmount)

      if (isLimit) {
        window.toast.error(
          t('Trade.Bench.TheMinimumPositionValue', {
            USD: openingMinLimit,
            Token: marginToken.symbol,
            Margin: keepDecimals(bnDiv(openingMinLimit, marginPrice), 2)
          })
        )
        return
      }

      const openPosParams = {
        side,
        price: _realPrice,
        symbol: marginToken.symbol,
        volume: state.openingAmount,
        leverage: leverageNow,
        openType: openingType
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
                disabled={openingType === PositionOrderTypes.Market}
              />
            </Col>
          </Row>
          <QuantityInput
            type={marginToken.symbol}
            value={state.openingAmount}
            onChange={(val) => dispatch({ type: 'SET_OPENING_AMOUNT', payload: val })}
          />
          <Row>
            <Col>
              <Button
                disabled={memoDisabled1 || memoDisabled2 || !quoteToken.address}
                noDisabledStyle
                className="web-trade-bench-button-short"
                onClick={() => openPositionDialog(PositionSideTypes.long)}
                type="buy"
              >
                <strong>{t('Trade.Bench.Long', 'Long')}</strong>
                <em>
                  {numeralNumber(memoLongPosApy, 2)}%<u>APR</u>
                </em>
              </Button>
            </Col>
            <Col>
              <Button
                disabled={memoDisabled1 || memoDisabled2 || !quoteToken.address}
                noDisabledStyle
                className="web-trade-bench-button-short"
                onClick={() => openPositionDialog(PositionSideTypes.short)}
                type="sell"
              >
                <strong>{t('Trade.Bench.Short', 'Short')}</strong>
                <em>
                  {numeralNumber(memoShortPosApy, 2)}%<u>APR</u>
                </em>
              </Button>
            </Col>
          </Row>
          {openingType === PositionOrderTypes.Market && (
            <Row>
              <Col>
                <Button
                  disabled={memoDisabled1 || memoDisabled2 || !quoteToken.address}
                  noDisabledStyle
                  className="web-trade-bench-button-full"
                  onClick={() => openPositionDialog(PositionSideTypes.twoWay)}
                  outline
                  full
                  type="blue"
                >
                  <strong>{t('Trade.Bench.TowWay', '2-Way')}</strong>
                  <em>
                    {numeralNumber(memo2WayPosApy, 2)}%<u>APR</u>
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
