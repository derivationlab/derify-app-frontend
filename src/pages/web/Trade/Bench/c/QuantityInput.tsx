import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect } from 'react'

import { findToken } from '@/config/tokens'
import { useProtocolConf, useSpotPrice } from '@/hooks/useMatchConf'
import { useMarginToken, useQuoteToken } from '@/zustand'
import { OpeningType, useCalcOpeningDAT } from '@/zustand/useCalcOpeningDAT'

import { Select, Input } from '@/components/common/Form'
import PercentButton from '@/components/common/Form/PercentButton'

import Row from './Row'
import Col from './Col'

interface Props {
  type: string | number
  value: number | string
  onChange: (value: number) => void
  onTypeChange: (value: string | number) => void
}

const QuantityInput: FC<Props> = ({ value, onChange, type, onTypeChange }) => {
  const { t } = useTranslation()
  const { data: account } = useAccount()

  const openingType = useCalcOpeningDAT((state) => state.openingType)
  const leverageNow = useCalcOpeningDAT((state) => state.leverageNow)
  const openingPrice = useCalcOpeningDAT((state) => state.openingPrice)
  const maxVolume = useCalcOpeningDAT((state) => state.maxVolume)
  const fetchMaxVolume = useCalcOpeningDAT((state) => state.fetchMaxVolume)
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)

  const { spotPrice } = useSpotPrice(quoteToken, marginToken)
  const { protocolConfig } = useProtocolConf()

  const onSelectChange = (val: string | number) => {
    onChange(0)
    onTypeChange(val)
  }

  useEffect(() => {
    const p = maxVolume?.[type] ?? 0
    if (value > p) onChange(p)
  }, [value, maxVolume])

  useEffect(() => {
    if (account?.address && protocolConfig) {
      const price = openingType === OpeningType.Market ? spotPrice : openingPrice
      void fetchMaxVolume(
        findToken(quoteToken)?.tokenAddress,
        account.address,
        price,
        protocolConfig.exchange,
        marginToken
      )
    }
  }, [spotPrice, quoteToken, openingType, leverageNow, openingPrice, protocolConfig, account?.address, marginToken])

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
            <em>{maxVolume?.[type] ?? 0} </em>
            <u>{type}</u>
          </div>
          试试
          <Select
            className="web-trade-bench-pane-volume-type"
            value={type}
            onChange={onSelectChange}
            options={[marginToken, quoteToken]}
          />
        </Col>
      </Row>
      <Row mb="36">
        <PercentButton currValue={value} value={maxVolume?.[type] ?? 0} onChange={(val) => onChange(val)} />
      </Row>
    </>
  )
}

export default QuantityInput
