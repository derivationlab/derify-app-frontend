import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Input from '@/components/common/Form/Input'
import PercentButton from '@/components/common/Form/PercentButton'
import { useDisposableAm } from '@/hooks/useDisposableAm'
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

const QuantityInput: FC<Props> = ({ type, value, onChange }) => {
  const { t } = useTranslation()
  const { address } = useAccount()

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

  const priceParam = useMemo(() => {
    return openingType === PositionOrderTypes.Market ? spotPrice : openingPrice
  }, [spotPrice, openingPrice, openingType])

  const { loaded, disposableAm, getDisposableAm } = useDisposableAm(
    priceParam,
    address ?? '',
    protocolConfig?.exchange ?? '',
    quoteToken,
    marginToken,
    leverageNow,
    openingType
  )

  const maximum = useMemo(() => {
    return nonBigNumberInterception(disposableAm?.[type] ?? 0, 2)
  }, [disposableAm, type])

  useEffect(() => {
    if (value > maximum) onChange(maximum)
  }, [value, maximum])

  useEffect(() => {
    PubSub.subscribe(PubSubEvents.UPDATE_POSITION_VOLUME, () => {
      void getDisposableAm()
    })
  }, [])

  return (
    <>
      <Row mb="0">
        <header className="web-trade-bench-pane-volume-header">{t('Trade.Bench.Volume', 'Volume')}</header>
        <div className="web-trade-bench-pane-volume-max">
          <span>Max: </span>
          {loaded ? (
            'loading ...'
          ) : (
            <>
              <em>{keepDecimals(disposableAm?.[type] ?? 0, 2)}</em>
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
