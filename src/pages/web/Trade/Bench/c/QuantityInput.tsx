import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useState, useEffect } from 'react'

import Trader from '@/class/Trader'
import { PriceType } from '@/typings'
import { getSymbol } from '@/utils/addressHelpers'
import { useShareMessage } from '@/store/share/hooks'
import { useMatchConfig } from '@/hooks/useMatchConfig'
import { useContractData } from '@/store/contract/hooks'
import { BASE_TOKEN_SYMBOL, findMarginToken } from '@/config/tokens'

import { Select, Input } from '@/components/common/Form'
import PercentButton from '@/components/common/Form/PercentButton'

import Row from './Row'
import Col from './Col'

interface Props {
  type: string | number
  value: number | string
  price: number | string
  leverage: number
  openType: PriceType
  onChange: (value: number) => void
  onTypeChange: (value: string | number) => void
}

let onetime = false

const QuantityInput: FC<Props> = ({ value, onChange, type, onTypeChange, leverage, openType, price }) => {
  const { t } = useTranslation()
  const { data: account } = useAccount()
  const { shareMessage } = useShareMessage()
  const { pairs, currentPair } = useContractData()
  const { protocolConfig, protocolConfigLoaded, marginToken } = useMatchConfig()

  const { getOpenUpperBound } = Trader

  const [isCalculating, setIsCalculating] = useState<boolean>(true)
  const [leverageVolume, setLeverageVolume] = useState<string>('0')

  const typeOptions = useMemo(() => {
    return [marginToken, getSymbol(currentPair)]
  }, [currentPair, marginToken])

  const memoPairInfo = useMemo(() => {
    return pairs.find((pair) => pair.token === currentPair) ?? {}
  }, [pairs, currentPair])

  const memoTokenSymbol = useMemo(
    () => (type === BASE_TOKEN_SYMBOL ? BASE_TOKEN_SYMBOL : getSymbol(currentPair)),
    [type, currentPair]
  )

  const typeChangeEv = (val: string | number) => {
    onChange(0)
    onTypeChange(val)
  }

  useEffect(() => {
    if (value > Number(leverageVolume)) onChange(Number(leverageVolume))
  }, [leverageVolume, value])

  useEffect(() => {
    const { spotPrice } = memoPairInfo

    const calcMaxVolumeFunc = async () => {
      if (!onetime) setIsCalculating(true)

      try {
        const _price = openType === 0 ? spotPrice : price

        if (_price && protocolConfigLoaded) {
          const [size, amount] = await getOpenUpperBound(
            currentPair,
            account!.address!,
            openType,
            _price,
            leverage,
            protocolConfig.exchange
          )

          setLeverageVolume(findMarginToken(type as string) ? amount : size)
          setIsCalculating(false)

          onetime = true
        }
      } catch (e) {
        console.info(e)
        setIsCalculating(false)
      }
    }

    if ((account?.address && spotPrice) || (shareMessage && shareMessage.type === 'MAX_VOLUME_UPDATE')) {
      void calcMaxVolumeFunc()
    }
  }, [
    leverage,
    openType,
    price,
    currentPair,
    account?.address,
    memoPairInfo?.spotPrice,
    memoTokenSymbol,
    shareMessage,
    type,
    protocolConfigLoaded,
    protocolConfig
  ])

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
            {isCalculating ? (
              'calculating...'
            ) : (
              <>
                <span>Max: </span>
                <em>{leverageVolume} </em>
                <u>{type}</u>
              </>
            )}
          </div>
          <Select
            className="web-trade-bench-pane-volume-type"
            value={type}
            onChange={typeChangeEv}
            options={typeOptions}
          />
        </Col>
      </Row>
      <Row mb="36">
        <PercentButton currValue={value} value={leverageVolume} onChange={(val) => onChange(val)} />
      </Row>
    </>
  )
}

export default QuantityInput
