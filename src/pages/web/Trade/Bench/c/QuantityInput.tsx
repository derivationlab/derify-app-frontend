import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect } from 'react'

import { findToken } from '@/config/tokens'
import { OpeningType, useCalcMaxVolume } from '@/zustand/useCalcMaxVolume'
import { useProtocolConf, useSpotPrice } from '@/hooks/useMatchConf'

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

  const openingType = useCalcMaxVolume((state) => state.openingType)
  const leverageNow = useCalcMaxVolume((state) => state.leverageNow)
  const openingPrice = useCalcMaxVolume((state) => state.openingPrice)
  const maxVolume = useCalcMaxVolume((state) => state.maxVolume)
  const fetchMaxVolume = useCalcMaxVolume((state) => state.fetch)

  const { protocolConfig } = useProtocolConf()
  const { spotPrice, quoteToken, marginToken } = useSpotPrice()

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
