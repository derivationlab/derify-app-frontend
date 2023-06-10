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
import { PositionOrderTypes, PubSubEvents } from '@/typings'
import { keepDecimals, nonBigNumberInterception } from '@/utils/tools'

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
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const openingType = usePositionOperationStore((state) => state.openingType)
  const leverageNow = usePositionOperationStore((state) => state.leverageNow)
  const openingPrice = usePositionOperationStore((state) => state.openingPrice)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[quoteToken.symbol] ?? '0'
  }, [quoteToken, tokenSpotPrices])

  const realPrice = useMemo(() => {
    return openingType === PositionOrderTypes.Market ? spotPrice : openingPrice
  }, [spotPrice, openingPrice, openingType])

  const getDisposableAm = useCallback(async () => {
    setDisposable(initDisposableAm)
    const trader = address ?? ''
    const exchange = protocolConfig?.exchange ?? ''
    const amount = await calcDisposableAmount(realPrice, trader, exchange, quoteToken.token, leverageNow, openingType)
    setDisposable({ amount, loaded: false })
  }, [realPrice, address, protocolConfig, quoteToken.token, leverageNow, openingType])

  const maximum = useMemo(() => {
    return nonBigNumberInterception(disposable.amount[1], 2)
  }, [disposable, type])

  useEffect(() => {
    if (value > maximum) onChange(maximum)
  }, [value, maximum])

  useEffect(() => {
    if (address && protocolConfig && Number(leverageNow) > 0 && Number(realPrice) > 0) void getDisposableAm()
    PubSub.subscribe(PubSubEvents.UPDATE_POSITION_VOLUME, () => {
      console.info('PubSubEvents.UPDATE_POSITION_VOLUME')
      if (address && protocolConfig && Number(leverageNow) > 0 && Number(realPrice) > 0) void getDisposableAm()
    })
  }, [address, realPrice, quoteToken, leverageNow, protocolConfig])

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
              <em>{keepDecimals(disposable.amount[1], 2)}</em>
              <u> {type}</u>
            </>
          )}
        </div>
      </Row>
      <Row mb="16">
        <Input
          className="web-trade-bench-pane-volume-input"
          value={value}
          onChange={(val) => onChange(Number(val))}
          type="number"
        />
        <div className="web-trade-bench-pane-volume-type">
          <div className="web-select-show-button">
            <label>{marginToken.symbol}</label>
          </div>
        </div>
      </Row>
      <Row mb="36">
        <PercentButton currValue={value} value={maximum} onChange={(val) => onChange(val)} />
      </Row>
    </>
  )
}

export default QuantityInput
