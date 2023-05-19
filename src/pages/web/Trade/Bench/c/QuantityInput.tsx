import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Input from '@/components/common/Form/Input'
import PercentButton from '@/components/common/Form/PercentButton'
import {
  usePositionOperationStore,
  useMarginTokenStore,
  useQuoteTokenStore,
  useProtocolConfigStore,
  useTokenSpotPricesStore
} from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { PositionOrderTypes, PubSubEvents, Rec } from '@/typings'
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

  const disposableAmount = usePositionOperationStore((state) => state.disposableAmount)
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const openingType = usePositionOperationStore((state) => state.openingType)
  const leverageNow = usePositionOperationStore((state) => state.leverageNow)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const openingPrice = usePositionOperationStore((state) => state.openingPrice)
  const getDisposableAmount = usePositionOperationStore((state) => state.getDisposableAmount)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[quoteToken.symbol] ?? '0'
  }, [quoteToken, tokenSpotPrices])

  const maximum = useMemo(() => {
    return nonBigNumberInterception(disposableAmount?.[type] ?? 0, 2)
  }, [disposableAmount, type])

  useEffect(() => {
    if (value > maximum) onChange(maximum)
  }, [value, maximum])

  const _getDisposableAmount = (
    account: string,
    exchange: string,
    spotPrice: string,
    openingPrice: string,
    openingType: PositionOrderTypes,
    quoteToken: Rec,
    marginToken: Rec
  ) => {
    const price = openingType === PositionOrderTypes.Market ? spotPrice : openingPrice

    void getDisposableAmount(quoteToken, account, price, exchange, marginToken)
  }

  useEffect(() => {
    if (address && protocolConfig) {
      void _getDisposableAmount(
        address,
        protocolConfig.exchange,
        spotPrice,
        openingPrice,
        openingType,
        quoteToken,
        marginToken
      )
    }

    PubSub.subscribe(PubSubEvents.UPDATE_POSITION_VOLUME, () => {
      if (address && protocolConfig) {
        void _getDisposableAmount(
          address,
          protocolConfig.exchange,
          spotPrice,
          openingPrice,
          openingType,
          quoteToken,
          marginToken
        )
      }
    })
  }, [address, spotPrice, quoteToken, openingType, leverageNow, marginToken, openingPrice, protocolConfig])

  return (
    <>
      <Row mb="0">
        <header className="web-trade-bench-pane-volume-header">{t('Trade.Bench.Volume', 'Volume')}</header>
        <div className="web-trade-bench-pane-volume-max">
          <span>Max: </span>
          <em>{keepDecimals(disposableAmount?.[type] ?? 0, 2)}</em>
          <u> {type}</u>
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
