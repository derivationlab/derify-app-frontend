import { useAtomValue } from 'jotai'
import PubSub from 'pubsub-js'

import React, { FC, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import { userBrokerBoundAtom } from '@/atoms/useBrokerData'
import Button from '@/components/common/Button'
import LeverageSelect from '@/components/common/Form/LeverageSelect'
import NotConnect from '@/components/web/NotConnect'
import { isOpeningMinLimit } from '@/funcs/helper'
import { useMarginPrice } from '@/hooks/useMarginPrice'
import { useOpeningMinLimit } from '@/hooks/useOpeningMinLimit'
import { usePositionOperation } from '@/hooks/usePositionOperation'
import { useTokenSpotPrice } from '@/hooks/useTokenSpotPrices'
import PositionOpenDialog from '@/pages/web/Trade/Dialogs/PositionOpen'
import { reducer, stateInit } from '@/reducers/opening'
import {
  usePositionOperationStore,
  useQuoteTokenStore,
  useMarginTokenStore,
  useTokenSpotPricesStore,
  useMarginIndicatorsStore,
  useProtocolConfigStore
} from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { PubSubEvents, PositionSideTypes, PositionOrderTypes } from '@/typings'
import emitter, { EventTypes } from '@/utils/emitter'
import { bnDiv, numeralNumber, isET, isGT, isLTET, keepDecimals } from '@/utils/tools'

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
  const userBrokerBound = useAtomValue(userBrokerBoundAtom)
  const spotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPricesForTrading)
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const openingParams = usePositionOperationStore((state) => state.openingParams)
  const updateOpeningParams = usePositionOperationStore((state) => state.updateOpeningParams)
  const { openingMinLimit } = useOpeningMinLimit(protocolConfig?.exchange)
  const { data: marginPrice } = useMarginPrice(protocolConfig?.priceFeed)
  const { spotPrice, precision } = useTokenSpotPrice(spotPrices, quoteToken.name)

  const longPosApy = useMemo(() => {
    const p = Number(marginIndicators?.[quoteToken.token]?.longPmrRate ?? 0)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [quoteToken, marginIndicators])

  const hedgePosApy = useMemo(() => {
    const p1 = Number(marginIndicators?.[quoteToken.token]?.shortPmrRate ?? 0)
    const p2 = Number(marginIndicators?.[quoteToken.token]?.longPmrRate ?? 0)
    if (p1 >= 0 && p2 >= 0) {
      const apy = ((p1 + p2) / 2) * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [quoteToken, marginIndicators])

  const shortPosApy = useMemo(() => {
    const p = Number(marginIndicators?.[quoteToken.token]?.shortPmrRate ?? 0)
    if (p >= 0) {
      const apy = p * 100
      return isLTET(apy, 0) ? 0 : apy
    }
    return '--'
  }, [quoteToken, marginIndicators])

  const disabled1 = useMemo(() => {
    return isLTET(Number(state.openingAmount), 0)
  }, [state.openingAmount])

  const disabled2 = useMemo(() => {
    return isLTET(openingParams.openingPrice, 0)
  }, [openingParams.openingPrice])

  const isOrderConversion = (openType: PositionOrderTypes, price: string): boolean => {
    return openType === PositionOrderTypes.Limit ? isET(spotPrice, price) : false
  }

  const openPositionFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending'))

    dispatch({ type: 'SET_MODAL_STATUS', payload: false })

    if (userBrokerBound?.broker && protocolConfig) {
      const { token } = quoteToken
      const { broker } = userBrokerBound
      const { exchange } = protocolConfig
      const { side, price, symbol } = state.openingParams
      const { openingType, leverageNow } = openingParams
      const conversion = isOrderConversion(openingType, price)
      const status = await increasePosition(
        exchange,
        broker,
        token,
        side,
        openingType,
        symbol,
        price,
        leverageNow,
        amount,
        precision,
        conversion
      )

      if (status) {
        // succeed
        window.toast.success(t('common.success'))

        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
        emitter.emit(EventTypes.updateTraderVariables)
      } else {
        window.toast.error(t('common.failed'))
        // failed
      }
    } else {
      window.toast.error(t('common.failed'))
      // failed
    }

    window.toast.dismiss(toast)
  }

  const openPositionDialog = async (side: PositionSideTypes) => {
    if (protocolConfig) {
      const _realPrice =
        openingParams.openingType === PositionOrderTypes.Market ? spotPrice : openingParams.openingPrice

      const isLimit = isOpeningMinLimit(marginPrice, openingMinLimit, state.openingAmount)

      if (isLimit) {
        window.toast.error(
          t('Trade.Bench.TheMinimumPositionValue', {
            USD: keepDecimals(openingMinLimit, 2),
            Token: marginToken.symbol,
            Margin: keepDecimals(bnDiv(openingMinLimit, marginPrice), marginToken.decimals)
          })
        )
        return
      }

      const openPosParams = {
        side,
        price: _realPrice,
        symbol: marginToken.symbol,
        volume: state.openingAmount,
        leverage: openingParams.leverageNow,
        openType: openingParams.openingType
      }
      dispatch({ type: 'SET_MODAL_STATUS', payload: true })
      dispatch({ type: 'SET_OPENING_PARAMS', payload: openPosParams })
    }
  }

  useEffect(() => {
    if (isGT(spotPrice, 0)) {
      updateOpeningParams({ openingPrice: spotPrice })
    }
  }, [spotPrice])

  return (
    <>
      <div className="web-trade-bench">
        <Info />
        <div className="web-trade-bench-pane">
          <Row>
            <Col label={t('Trade.Bench.PriceType', 'Price Type')}>
              <OpenTypeSelect
                value={openingParams.openingType}
                onChange={(val) => updateOpeningParams({ openingType: val })}
              />
            </Col>
            <Col label={t('Trade.Bench.Leverage', 'Leverage')}>
              <LeverageSelect
                className="web-trade-bench-leverage"
                value={openingParams.leverageNow}
                onChange={(val) => updateOpeningParams({ leverageNow: val })}
              />
            </Col>
          </Row>
          <Row>
            <Col label={t('Trade.Bench.Price', 'Price')}>
              <PriceInput
                value={openingParams.openingPrice}
                onChange={(v) => updateOpeningParams({ openingPrice: v as any })}
                disabled={openingParams.openingType === PositionOrderTypes.Market}
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
                disabled={disabled1 || disabled2 || !quoteToken.token}
                noDisabledStyle
                className="web-trade-bench-button-short"
                onClick={() => openPositionDialog(PositionSideTypes.long)}
                type="buy"
              >
                <strong>{t('Trade.Bench.Long', 'Long')}</strong>
                <em>
                  {numeralNumber(longPosApy, 2)}%<u>APR</u>
                </em>
              </Button>
            </Col>
            <Col>
              <Button
                disabled={disabled1 || disabled2 || !quoteToken.token}
                noDisabledStyle
                className="web-trade-bench-button-short"
                onClick={() => openPositionDialog(PositionSideTypes.short)}
                type="sell"
              >
                <strong>{t('Trade.Bench.Short', 'Short')}</strong>
                <em>
                  {numeralNumber(shortPosApy, 2)}%<u>APR</u>
                </em>
              </Button>
            </Col>
          </Row>
          {openingParams.openingType === PositionOrderTypes.Market && (
            <Row>
              <Col>
                <Button
                  disabled={disabled1 || disabled2 || !quoteToken.token}
                  noDisabledStyle
                  className="web-trade-bench-button-full"
                  onClick={() => openPositionDialog(PositionSideTypes.twoWay)}
                  outline
                  full
                  type="blue"
                >
                  <strong>{t('Trade.Bench.TowWay', '2-Way')}</strong>
                  <em>
                    {numeralNumber(hedgePosApy, 2)}%<u>APR</u>
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
