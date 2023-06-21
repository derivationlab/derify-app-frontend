import { getAddress } from 'ethers/lib/utils'

import React, { FC, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import {
  usePositionOperationStore,
  useMarginTokenStore,
  useTokenSpotPricesStore,
  useMarginIndicatorsStore,
  useDerivativeListStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { PositionSideTypes } from '@/typings'
import { bnMul, isGT, isGTET, keepDecimals, nonBigNumberInterception, numeralNumber } from '@/utils/tools'

import QuantityInput from './QuantityInput'

interface Props {
  data: Record<string, any>
  loading?: boolean
  visible: boolean
  onClose: () => void
  onClick: () => void
}

const PositionClose: FC<Props> = ({ data, visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const openingParams = usePositionOperationStore((state) => state.openingParams)
  const updateOpeningParams = usePositionOperationStore((state) => state.updateOpeningParams)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)

  const decimals = useMemo(() => {
    const find = derivativeList.find((d) => d.name === data.derivative)
    return find?.price_decimals ?? 2
  }, [derivativeList])

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[data?.derivative] ?? '0'
  }, [data, tokenSpotPrices])

  const memoVolume = useMemo(() => {
    return nonBigNumberInterception(bnMul(spotPrice, data?.size), marginToken.decimals)
  }, [data, spotPrice, marginToken])

  const memoChangeRate = useMemo(() => {
    if (marginIndicators) {
      const findKey = Object.keys(marginIndicators).find((m) => getAddress(m) === getAddress(data?.token))
      const value = findKey ? marginIndicators[findKey]?.price_change_rate ?? 0 : 0
      return bnMul(value, 100)
    }
    return '0'
  }, [data, marginIndicators])

  useEffect(() => {
    if (!visible) updateOpeningParams({ closingAmount: '0' })
    updateOpeningParams({ closingAmount: memoVolume })
  }, [visible, memoVolume])

  const closeableAmount = useMemo(() => {
    const size = data?.size ?? 0
    return Number(size) < 1 ? nonBigNumberInterception(size, 8) : numeralNumber(size, 2)
  }, [data?.size])

  return (
    <>
      <Dialog
        width="540px"
        visible={visible}
        title={t('Trade.ClosePosition.ClosePosition', 'Close Position')}
        onClose={onClose}
      >
        <div className="web-trade-dialog web-trade-dialog-position-close">
          <div className="web-trade-dialog-body">
            <div className="web-trade-dialog-position-info">
              <header className="web-trade-dialog-position-info-header">
                <h4>
                  <strong>{data?.derivative}</strong>
                  <MultipleStatus multiple={data?.leverage} direction={PositionSideTypes[data?.side] as any} />
                </h4>
              </header>
              <section className="web-trade-dialog-position-info-data">
                <BalanceShow value={spotPrice} unit="" decimal={Number(spotPrice) === 0 ? 2 : decimals} />
                <span className={isGTET(memoChangeRate, 0) ? 'buy' : 'sell'}>{keepDecimals(memoChangeRate, 2)}%</span>
              </section>
              <section className="web-trade-dialog-position-info-count">
                <p>
                  {t('Trade.ClosePosition.PositionAveragePrice', 'Position Average Price')} :{' '}
                  <em>{keepDecimals(data?.averagePrice ?? 0, Number(data?.averagePrice ?? 0) === 0 ? 2 : decimals)}</em>{' '}
                  {VALUATION_TOKEN_SYMBOL}
                </p>
                <p>
                  {/*const output = Number(size) < 1 ? nonBigNumberInterception(size, 8) : numeralNumber(size, 2)*/}
                  {t('Trade.ClosePosition.PositionCloseable', 'Position Closeable')} : <em>{closeableAmount}</em>{' '}
                  {data?.quoteToken} / <em>{numeralNumber(memoVolume, marginToken.decimals)}</em> {marginToken.symbol}
                </p>
              </section>
            </div>
            <QuantityInput
              value={openingParams.closingAmount}
              maxSwap={memoVolume}
              marginToken={marginToken.symbol}
              onChange={(v) => updateOpeningParams({ closingAmount: v as any })}
            />
          </div>
          <Button disabled={!isGT(openingParams.closingAmount, 0)} onClick={onClick}>
            {t('Trade.ClosePosition.Confirm', 'Confirm')}
          </Button>
        </div>
      </Dialog>
    </>
  )
}

export default PositionClose
