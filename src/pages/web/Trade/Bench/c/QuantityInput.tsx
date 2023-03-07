import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo } from 'react'

import { findToken } from '@/config/tokens'
import { useQuoteToken } from '@/zustand'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { MarginTokenKeys, PubSubEvents } from '@/typings'
import { useProtocolConf, useSpotPrice } from '@/hooks/useMatchConf'
import { OpeningType, useCalcOpeningDAT } from '@/zustand/useCalcOpeningDAT'
import { keepDecimals, nonBigNumberInterception } from '@/utils/tools'

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
  const { data: account } = useAccount()

  const maxVolume = useCalcOpeningDAT((state) => state.maxVolume)
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const openingType = useCalcOpeningDAT((state) => state.openingType)
  const leverageNow = useCalcOpeningDAT((state) => state.leverageNow)
  const openingPrice = useCalcOpeningDAT((state) => state.openingPrice)
  const fetchMaxVolume = useCalcOpeningDAT((state) => state.fetchMaxVolume)

  const marginToken = useMTokenFromRoute()

  const { spotPrice } = useSpotPrice(quoteToken, marginToken)
  const { protocolConfig } = useProtocolConf(quoteToken, marginToken)

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
    if (account?.address && protocolConfig) {
      void _fetchMaxVolume(
        account.address,
        protocolConfig.exchange,
        spotPrice,
        openingPrice,
        openingType,
        quoteToken,
        marginToken
      )
    }

    PubSub.subscribe(PubSubEvents.UPDATE_POSITION_VOLUME, () => {
      if (account?.address && protocolConfig) {
        void _fetchMaxVolume(
          account.address,
          protocolConfig.exchange,
          spotPrice,
          openingPrice,
          openingType,
          quoteToken,
          marginToken
        )
      }
    })
  }, [account?.address, spotPrice, quoteToken, openingType, leverageNow, marginToken, openingPrice, protocolConfig])

  return (
    <>
      <Row mb="16">
        <Col label={t('Trade.Bench.Volume', 'Volume')}>
          <Input
            className="web-trade-bench-pane-volume-input"
            value={value}
            onChange={(val) => onChange(Number(val))}
            type="number"
          />
        </Col>
        <Col>
          <div className="web-trade-bench-pane-volume-max">
            <span>Max: </span>
            <em>{keepDecimals(maxVolume?.[type] ?? 0, findToken(type)?.decimals ?? 2)} </em>
            <u>{type}</u>
          </div>
          <Select
            className="web-trade-bench-pane-volume-type"
            value={type}
            onChange={onSelectChange}
            options={[marginToken, quoteToken]}
          />
        </Col>
      </Row>
      <Row mb="36">
        <PercentButton currValue={value} value={visibleMaxVol} onChange={(val) => onChange(val)} />
      </Row>
    </>
  )
}

export default QuantityInput
