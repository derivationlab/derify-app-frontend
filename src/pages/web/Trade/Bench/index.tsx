import BN from 'bignumber.js'
import { isEmpty } from 'lodash'
import { useSigner } from 'wagmi'
import { batch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo, useState } from 'react'
import Trader from '@/class/Trader'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useAppDispatch } from '@/store'
import { getMyPositionsDataAsync } from '@/store/contract'
import { PositionSide } from '@/store/contract/helper'
import { useTraderData } from '@/store/trader/hooks'
import { setShareMessage } from '@/store/share'
import { useContractData } from '@/store/contract/hooks'
import { getTraderDataAsync } from '@/store/trader'
import { getCurrentPositionsAmountDataAsync } from '@/store/constant'
import { LeverageSelect } from '@/components/common/Form'
import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import PositionOpenDialog from '@/pages/web/Trade/Dialogs/PositionOpen'
import Initializing from './c/Initializing'
import Info from './c/Info'
import Row from './c/Row'
import Col from './c/Col'
import OpenTypeSelect from './c/OpenTypeSelect'
import PriceInput from './c/PriceInput'
import QuantityInput from './c/QuantityInput'

export enum PriceType {
  Market,
  Limit
}

const Bench: FC = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { brokerBound: broker } = useTraderData()
  const { pairs, currentPair } = useContractData()
  const { openPositionOrder, minimumOpenPositionLimit } = Trader

  const [openType, setOpenType] = useState<PriceType>(PriceType.Market)
  const [leverage, setLeverage] = useState<number>(10)
  const [limitPrice, setLimitPrice] = useState(0) // todo type
  const [quantity, setQuantity] = useState<number | string>('') // todo type
  const [quantityType, setQuantityType] = useState<any>(BASE_TOKEN_SYMBOL) // todo type
  const [dialogStatus, setDialogStatus] = useState<boolean>(false)
  const [openPosParams, setOpenPosParams] = useState<Record<string, any>>({})

  const memoPairInfo = useMemo(() => {
    return pairs.find((pair) => pair.token === currentPair)
  }, [pairs, currentPair])

  const memoLongPosApy = useMemo(() => {
    if (!isEmpty(memoPairInfo) && memoPairInfo?.longPmrRate) {
      const apy = new BN(memoPairInfo?.longPmrRate).times(100)
      return apy.isLessThanOrEqualTo(0) ? '--' : String(apy)
    }
    return '--'
  }, [memoPairInfo])

  const memo2WayPosApy = useMemo(() => {
    if (!isEmpty(memoPairInfo)) {
      const apy = new BN(memoPairInfo?.shortPmrRate ?? 0)
        .plus(memoPairInfo?.longPmrRate ?? 0)
        .div(2)
        .times(100)
      return apy.isLessThanOrEqualTo(0) ? '--' : String(apy)
    }
    return '--'
  }, [memoPairInfo])

  const memoShortPosApy = useMemo(() => {
    if (!isEmpty(memoPairInfo) && memoPairInfo?.shortPmrRate) {
      const apy = new BN(memoPairInfo?.shortPmrRate).times(100)
      return apy.isLessThanOrEqualTo(0) ? '--' : String(apy)
    }
    return '--'
  }, [memoPairInfo])

  const memoDisabledCondition1 = useMemo(() => {
    const _quantity = new BN(quantity)
    return !quantity || _quantity.isLessThanOrEqualTo(0)
  }, [quantity])

  const memoDisabledCondition2 = useMemo(() => {
    if (openType === PriceType.Limit) {
      const _limitPrice = new BN(limitPrice)
      return !_limitPrice || _limitPrice.isLessThanOrEqualTo(0)
    }
    return false
  }, [limitPrice, openType])

  const isOrderConversion = (openType: PriceType, price: string): boolean => {
    if (openType === PriceType.Limit) {
      return new BN(memoPairInfo?.spotPrice).isEqualTo(price)
    }
    return false
  }

  const openPositionFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    setDialogStatus(false)

    if (signer && broker?.broker) {
      const _isOrderConversion = isOrderConversion(openPosParams?.openType, openPosParams?.price)

      const account = await signer.getAddress()
      const status = await openPositionOrder(
        signer,
        broker.broker,
        openPosParams?.token,
        openPosParams?.side,
        openPosParams?.openType,
        openPosParams?.symbol,
        openPosParams?.volume,
        openPosParams?.price,
        openPosParams?.leverage,
        _isOrderConversion
      )

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        batch(() => {
          dispatch(getTraderDataAsync(account))
          dispatch(getMyPositionsDataAsync(account))
          dispatch(getCurrentPositionsAmountDataAsync())
          dispatch(setShareMessage({ type: 'MAX_VOLUME_UPDATE', extraType: 'UPDATE_TRADE_HISTORY' }))
        })
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }
    } else {
      window.toast.error(t('common.failed', 'failed'))
      // failed
    }

    window.toast.dismiss(toast)
  }

  const openPositionDialog = (side: string) => {
    let apy = '0'
    let _openType = openType
    const _price = openType === PriceType.Market ? memoPairInfo?.spotPrice : limitPrice

    const isLimit = minimumOpenPositionLimit(side, _price, quantity, quantityType)

    if (isLimit) {
      window.toast.error(t('Trade.Bench.MinNumber', 'The minimum number is 100U'))
      return
    }

    if (side === 'Long') apy = memoLongPosApy
    if (side === 'Short') apy = memoShortPosApy
    if (side === '2-Way') apy = memo2WayPosApy

    if (openType === 1) {
      const _limitPrice = new BN(limitPrice)
      if (side === 'Long') {
        if (_limitPrice.isGreaterThan(memoPairInfo?.spotPrice)) {
          _openType = 0
        }
      }
      if (side === 'Short') {
        if (_limitPrice.isLessThan(memoPairInfo?.spotPrice)) {
          _openType = 0
        }
      }
    }

    const openPosParams = {
      apy,
      side: PositionSide[side as any],
      name: memoPairInfo?.name,
      price: _price,
      token: memoPairInfo?.token,
      symbol: quantityType,
      volume: quantity,
      leverage: leverage,
      openType: _openType
    }

    setOpenPosParams(openPosParams)
    setDialogStatus(true)
  }

  useEffect(() => {
    if (openType === 1) setLimitPrice(memoPairInfo?.spotPrice)
  }, [currentPair, openType, memoPairInfo?.spotPrice])

  // todo check
  useEffect(() => {
    if (quantityType !== BASE_TOKEN_SYMBOL) {
      setQuantityType(memoPairInfo?.symbol)
    }
  }, [quantityType, memoPairInfo?.symbol])

  return (
    <>
      <div className="web-trade-bench">
        <Info />
        <div className="web-trade-bench-pane">
          <Row>
            <Col label={t('Trade.Bench.PriceType', 'Price Type')}>
              <OpenTypeSelect value={openType} onChange={(type) => setOpenType(type)} />
            </Col>
            <Col label={t('Trade.Bench.Leverage', 'Leverage')}>
              <LeverageSelect
                className="web-trade-bench-leverage"
                value={leverage}
                onChange={(leverage) => setLeverage(leverage)}
              />
            </Col>
          </Row>
          <Row>
            <Col label={t('Trade.Bench.Price', 'Price')}>
              <PriceInput
                value={limitPrice}
                onChange={(val) => setLimitPrice(val)}
                disabled={openType === PriceType.Market}
              />
            </Col>
          </Row>
          <QuantityInput
            value={quantity}
            leverage={leverage}
            openType={openType}
            price={limitPrice}
            onChange={(val: number | string) => setQuantity(val)}
            type={quantityType}
            onTypeChange={(val) => setQuantityType(val)}
          />
          <Row>
            <Col>
              <Button
                disabled={memoDisabledCondition1 || memoDisabledCondition2}
                noDisabledStyle
                className="web-trade-bench-button-short"
                onClick={() => openPositionDialog('Long')}
                type="buy"
              >
                <strong>{t('Trade.Bench.Long', 'Long')}</strong>
                <em>
                  {memoLongPosApy}%<u>APY</u>
                </em>
              </Button>
            </Col>
            <Col>
              <Button
                disabled={memoDisabledCondition1 || memoDisabledCondition2}
                noDisabledStyle
                className="web-trade-bench-button-short"
                onClick={() => openPositionDialog('Short')}
                type="sell"
              >
                <strong>{t('Trade.Bench.Short', 'Short')}</strong>
                <em>
                  {memoShortPosApy}%<u>APY</u>
                </em>
              </Button>
            </Col>
          </Row>
          {openType === 0 && (
            <Row>
              <Col>
                <Button
                  disabled={memoDisabledCondition1 || memoDisabledCondition2}
                  noDisabledStyle
                  className="web-trade-bench-button-full"
                  onClick={() => openPositionDialog('2-Way')}
                  outline
                  full
                  type="blue"
                >
                  <strong>{t('Trade.Bench.TowWay', '2-Way')}</strong>
                  <em>
                    {memo2WayPosApy}%<u>APY</u>
                  </em>
                </Button>
              </Col>
            </Row>
          )}
        </div>
        <NotConnect />
        <Initializing />
      </div>
      <PositionOpenDialog
        data={openPosParams}
        visible={dialogStatus}
        onClose={() => setDialogStatus(false)}
        onClick={openPositionFunc}
      />
    </>
  )
}

export default Bench
