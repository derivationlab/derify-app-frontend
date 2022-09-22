import React, { FC, useMemo, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'

import Trader from '@/class/Trader'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useContractData } from '@/store/contract/hooks'
import { useShareMessage } from '@/store/share/hooks'
import { getSymbol } from '@/utils/addressHelpers'

import { Select, Input } from '@/components/common/Form'
import PercentButton from '@/components/common/Form/PercentButton'

import { PriceType } from '@/pages/web/Trade/Bench'

import Row from './Row'
import Col from './Col'

// todo make types declare better
interface Props {
  value: number | string
  onChange: (value: number) => void
  type: string | number
  onTypeChange: (value: string | number) => void
  leverage: number
  openType: PriceType
  price: number | string
}

const QuantityInput: FC<Props> = ({ value, onChange, type, onTypeChange, leverage, openType, price }) => {
  const { t } = useTranslation()
  const { data: account } = useAccount()
  const { getOpenUpperBound } = Trader
  const { pairs, currentPair } = useContractData()
  const { shareMessage } = useShareMessage()

  const [isCalculating, setIsCalculating] = useState<boolean>(true)
  const [leverageVolume, setLeverageVolume] = useState<string>('0')

  const typeOptions = useMemo(() => [BASE_TOKEN_SYMBOL, getSymbol(currentPair)], [currentPair])

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

  // todo too much Deps ?
  useEffect(() => {
    const { spotPrice } = memoPairInfo

    const calcMaxVolumeFunc = async () => {
      setIsCalculating(true)

      try {
        const _price = openType === 0 ? spotPrice : price

        if (_price) {
          const [size, amount] = await getOpenUpperBound(currentPair, account!.address!, openType, _price, leverage)
          console.info([size, amount])
          setLeverageVolume(memoTokenSymbol === BASE_TOKEN_SYMBOL ? amount : size)
          setIsCalculating(false)
        }
      } catch (e) {
        console.info(e)
        setIsCalculating(false)
      }
    }

    if ((account?.address && spotPrice) || (shareMessage && shareMessage.type === 'MAX_VOLUME_UPDATE')) {
      void calcMaxVolumeFunc()
    }
  }, [leverage, openType, price, currentPair, account?.address, memoPairInfo?.spotPrice, memoTokenSymbol, shareMessage])

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
                <u>{memoTokenSymbol}</u>
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
