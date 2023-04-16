import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo } from 'react'

import { findToken } from '@/config/tokens'
import { MarginTokenKeys, PubSubEvents } from '@/typings'
import { useProtocolConf, useSpotPrice } from '@/hooks/useMatchConf'
import { keepDecimals, nonBigNumberInterception } from '@/utils/tools'
import { OpeningType, useOpeningStore, useMarginTokenStore, useQuoteTokenStore } from '@/store'

import { Select, Input } from '@/components/common/Form'
import PercentButton from '@/components/common/Form/PercentButton'

import Row from './Row'
import Col from './Col'

interface Props {
  type: string
  value: number | string
  onChange: (value: number | string) => void
  onTypeChange: (value: string | number) => void
}

const QuantityInput: FC<Props> = ({ value, onChange, type, onTypeChange }) => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const maxVolume = useOpeningStore((state) => state.maxVolume)
  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const openingType = useOpeningStore((state) => state.openingType)
  const leverageNow = useOpeningStore((state) => state.leverageNow)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const openingPrice = useOpeningStore((state) => state.openingPrice)
  const fetchMaxVolume = useOpeningStore((state) => state.fetchMaxVolume)

  const { spotPrice } = useSpotPrice(quoteToken, marginToken)
  const { protocolConfig } = useProtocolConf(marginToken)

  const onSelectChange = (val: string | number) => {
    onChange(0)
    onTypeChange(val)
  }

  const visibleMaxVol = useMemo(() => {
    return nonBigNumberInterception(maxVolume?.[type] ?? 0, findToken(type)?.decimals ?? 2)
  }, [maxVolume, type])

  useEffect(() => {
    if (value > visibleMaxVol) onChange(visibleMaxVol)
  }, [value, visibleMaxVol])

  const _fetchMaxVolume = (
    account: string,
    protocolConfig: string,
    spotPrice: string,
    openingPrice: string,
    openingType: OpeningType,
    quoteToken: string,
    marginToken: MarginTokenKeys
  ) => {
    const price = openingType === OpeningType.Market ? spotPrice : openingPrice
    const qtAddress = findToken(quoteToken)?.tokenAddress

    void fetchMaxVolume(qtAddress, account, price, protocolConfig, marginToken)
  }

  useEffect(() => {
    if (address && protocolConfig) {
      void _fetchMaxVolume(
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
        void _fetchMaxVolume(
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
          <em>{keepDecimals(maxVolume?.[type] ?? 0, findToken(type)?.decimals ?? 2)} </em>
          <u>{type}</u>
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
            <label>{marginToken}</label>
          </div>
        </div>
      </Row>
      <Row mb="36">
        <PercentButton currValue={value} value={visibleMaxVol} onChange={(val) => onChange(val)} />
      </Row>
    </>
  )
}

export default QuantityInput
