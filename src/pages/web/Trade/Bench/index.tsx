import BN from 'bignumber.js'
import PubSub from 'pubsub-js'
import { isEmpty } from 'lodash'
import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo, useReducer } from 'react'

import Trader from '@/class/Trader'
import { PubSubEvents } from '@/typings'
import { useProtocolConf, useSpotPrice } from '@/hooks/useMatchConf'
import { PositionSide } from '@/store/contract/helper'
import { useTraderData } from '@/store/trader/hooks'
import { useMatchConfig } from '@/hooks/useMatchConfig'
import { useContractData } from '@/store/contract/hooks'
import { reducer, stateInit } from '@/reducers/openingPosition'
import { isET, isGT, isLT, isLTET } from '@/utils/tools'
import { OpeningType, useCalcMaxVolume } from '@/zustand/useCalcMaxVolume'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import PositionOpenDialog from '@/pages/web/Trade/Dialogs/PositionOpen'
import { LeverageSelect } from '@/components/common/Form'

import Row from './c/Row'
import Col from './c/Col'
import Info from './c/Info'
import PriceInput from './c/PriceInput'
import Initializing from './c/Initializing'
import QuantityInput from './c/QuantityInput'
import OpenTypeSelect from './c/OpenTypeSelect'
import { usePairsInfo } from '@/zustand'
import { findToken } from '@/config/tokens'

const Bench: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { brokerBound: broker } = useTraderData()
  const { pairs, currentPair } = useContractData()

  const { openPositionOrder, minimumOpenPositionLimit } = Trader

  const indicators = usePairsInfo((state) => state.indicators)
  const openingType = useCalcMaxVolume((state) => state.openingType)
  const leverageNow = useCalcMaxVolume((state) => state.leverageNow)
  const openingPrice = useCalcMaxVolume((state) => state.openingPrice)
  const updateLeverageNow = useCalcMaxVolume((state) => state.updateLeverageNow)
  const updateOpeningType = useCalcMaxVolume((state) => state.updateOpeningType)
  const updateOpeningPrice = useCalcMaxVolume((state) => state.updateOpeningPrice)
  const { protocolConfig } = useProtocolConf()
  const { spotPrice, marginToken, quoteToken } = useSpotPrice()

  const memoPairInfo = useMemo(() => {
    return pairs.find((pair) => pair.token === currentPair)
  }, [pairs, currentPair])

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
      const apy = (p1 + p2) / 2 * 100
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

  const memoDisabledCondition1 = useMemo(() => {
    return isLTET(Number(state.openingAmount), 0)
  }, [state.openingAmount])

  const memoDisabledCondition2 = useMemo(() => {
    return isLTET(openingPrice, 0)
  }, [openingPrice])

  const isOrderConversion = (openType: OpeningType, price: string): boolean => {
    return openType === OpeningType.Limit ? isET(spotPrice, price) : false
  }

  const openPositionFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    dispatch({ type: 'SET_MODAL_STATUS', payload: false })

    if (signer && broker?.broker && protocolConfig) {
      const _isOrderConversion = isOrderConversion(openingType, state.openingParams?.price)

      const status = await openPositionOrder(
        signer,
        broker.broker,
        findToken(quoteToken).tokenAddress,
        state.openingParams?.side,
        openingType,
        state.openingParams?.symbol,
        state.openingParams?.volume,
        state.openingParams?.price,
        leverageNow,
        protocolConfig.exchange,
        _isOrderConversion
      )

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
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

  const openPositionDialog = (side: string) => {
    let apy: any = ''
    let _openType = openingType
    const _realPrice = openingType === OpeningType.Market ? spotPrice : openingPrice

    const isLimit = minimumOpenPositionLimit(side, _realPrice, state.openingAmount, state.tokenSelect)

    if (isLimit) {
      window.toast.error(t('Trade.Bench.MinNumber', 'The minimum number is 500U', { limit: 500 }))
      return
    }

    if (side === 'Long') apy = memoLongPosApy
    if (side === 'Short') apy = memoShortPosApy
    if (side === '2-Way') apy = memo2WayPosApy

    if (openingType === OpeningType.Limit) {
      if (side === 'Long') {
        if (isGT(openingPrice, spotPrice)) _openType = 0
      }
      if (side === 'Short') {
        if (isLT(openingPrice, spotPrice)) _openType = 0
      }
    }

    const openPosParams = {
      apy,
      side: PositionSide[side as any],
      name: memoPairInfo?.name,
      price: _realPrice,
      token: memoPairInfo?.token,
      quote: memoPairInfo?.symbol,
      symbol: state.tokenSelect,
      volume: state.openingAmount,
      leverage: leverageNow,
      openType: _openType
    }

    dispatch({ type: 'SET_OPENING_PARAMS', payload: openPosParams })
    dispatch({ type: 'SET_MODAL_STATUS', payload: true })
  }

  useEffect(() => {
    if (Number(spotPrice) > 0) {
      updateOpeningPrice(spotPrice)
    }
  }, [spotPrice])

  useEffect(() => {
    dispatch({ type: 'SET_TOKEN_SELECT', payload: marginToken })
  }, [marginToken])

  return (
    <>
      <div className='web-trade-bench'>
        <Info />
        <div className='web-trade-bench-pane'>
          <Row>
            <Col label={t('Trade.Bench.PriceType', 'Price Type')}>
              <OpenTypeSelect
                value={openingType}
                onChange={updateOpeningType}
              />
            </Col>
            <Col label={t('Trade.Bench.Leverage', 'Leverage')}>
              <LeverageSelect
                className='web-trade-bench-leverage'
                value={leverageNow}
                onChange={updateLeverageNow}
              />
            </Col>
          </Row>
          <Row>
            <Col label={t('Trade.Bench.Price', 'Price')}>
              <PriceInput
                value={openingPrice}
                onChange={updateOpeningPrice}
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
                noDisabledStyle
                className='web-trade-bench-button-short'
                onClick={() => openPositionDialog('Long')}
                type='buy'
              >
                <strong>{t('Trade.Bench.Long', 'Long')}</strong>
                <em>
                  {memoLongPosApy}%<u>APR</u>
                </em>
              </Button>
            </Col>
            <Col>
              <Button
                disabled={memoDisabledCondition1 || memoDisabledCondition2}
                noDisabledStyle
                className='web-trade-bench-button-short'
                onClick={() => openPositionDialog('Short')}
                type='sell'
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
                  disabled={memoDisabledCondition1 || memoDisabledCondition2}
                  noDisabledStyle
                  className='web-trade-bench-button-full'
                  onClick={() => openPositionDialog('2-Way')}
                  outline
                  full
                  type='blue'
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
        <Initializing />
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
