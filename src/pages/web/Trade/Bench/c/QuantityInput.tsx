import { debounce } from 'lodash'
import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Input from '@/components/common/Form/Input'
import PercentButton from '@/components/common/Form/PercentButton'
import { calcDisposableAmount } from '@/funcs/helper'
import {
  usePositionOperationStore,
  useMarginTokenStore,
  useQuoteTokenStore,
  useProtocolConfigStore,
  useTokenSpotPricesStore
} from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { PositionOrderTypes, PubSubEvents, Rec } from '@/typings'
import { isGT, keepDecimals, nonBigNumberInterception } from '@/utils/tools'

import Row from './Row'

interface Props {
  type: string
  value: number | string
  onChange: (value: number | string) => void
}

interface DisposableAm {
  loaded: boolean
  amount: string[]
}

const initDisposableAm: DisposableAm = { loaded: true, amount: ['0', '0'] }

const QuantityInput: FC<Props> = ({ type, value, onChange }) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const [disposable, setDisposable] = useState<DisposableAm>(initDisposableAm)
  const spotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPricesForTrading)
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const openingParams = usePositionOperationStore((state) => state.openingParams)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

  const spotPrice = useMemo(() => {
    if (spotPrices) {
      const find = spotPrices.find((t: Rec) => t.name === quoteToken.symbol)
      return find?.price ?? '0'
    }
    return '0'
  }, [quoteToken, spotPrices])

  const realPrice = useMemo(() => {
    return openingParams.openingType === PositionOrderTypes.Market ? spotPrice : openingParams.openingPrice
  }, [spotPrice, openingParams.openingPrice, openingParams.openingType])

  const getDisposable = useCallback(
    debounce(
      async (
        realPrice: string,
        trader: string,
        exchange: string,
        quoteToken: string,
        leverageNow: number,
        openingType: PositionOrderTypes
      ) => {
        const amount = await calcDisposableAmount(realPrice, trader, exchange, quoteToken, leverageNow, openingType)
        setDisposable({ amount, loaded: false })
      },
      1000
    ),
    []
  )

  const maximum = useMemo(() => {
    return nonBigNumberInterception(disposable.amount[1], marginToken.decimals)
  }, [type, marginToken, disposable])

  useEffect(() => {
    if (isGT(value, maximum)) onChange(maximum)
  }, [value, maximum])

  useEffect(() => {
    const trader = address ?? ''
    const exchange = protocolConfig?.exchange ?? ''
    setDisposable((val) => ({ ...val, loaded: true }))
    if (trader && quoteToken && exchange && Number(openingParams.leverageNow) > 0 && Number(realPrice) > 0) {
      void getDisposable(
        realPrice,
        trader,
        exchange,
        quoteToken.token,
        openingParams.leverageNow,
        openingParams.openingType
      )
    }

    PubSub.subscribe(PubSubEvents.UPDATE_POSITION_VOLUME)
    PubSub.subscribe(PubSubEvents.UPDATE_POSITION_VOLUME, () => {
      if (trader && quoteToken && exchange && Number(openingParams.leverageNow) > 0 && Number(realPrice) > 0) {
        void getDisposable(
          realPrice,
          trader,
          exchange,
          quoteToken.token,
          openingParams.leverageNow,
          openingParams.openingType
        )
      }
    })
  }, [address, realPrice, quoteToken, openingParams.leverageNow, protocolConfig])

  return (
    <>
      <Row mb="0">
        <header className="web-trade-bench-pane-volume-header">{t('Trade.Bench.Volume', 'Volume')}</header>
        <div className="web-trade-bench-pane-volume-max">
          <span>Max: </span>
          {disposable.loaded ? (
            'loading ...'
          ) : (
            <>
              <em>
                {keepDecimals(disposable.amount[1], Number(disposable.amount[1]) === 0 ? 2 : marginToken.decimals)}
              </em>
              <u> {type}</u>
            </>
          )}
        </div>
      </Row>
      <Row mb="16">
        <Input className="web-trade-bench-pane-volume-input" type="number" value={value} onChange={onChange} />
        <div className="web-trade-bench-pane-volume-type">
          <div className="web-select-show-button">
            <label>{marginToken.symbol}</label>
          </div>
        </div>
      </Row>
      <Row mb="36">
        <PercentButton currValue={value} value={maximum} onChange={onChange} />
      </Row>
    </>
  )
}

export default QuantityInput
