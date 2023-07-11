import { getAddress } from 'ethers/lib/utils'

import React, { FC, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import MultipleStatus from '@/components/web/MultipleStatus'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { usePositionOperationStore, useMarginTokenStore, useMarginIndicatorsStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { PositionSideTypes } from '@/typings'
import { bnMul, formatUnits, isGT, isGTET, keepDecimals, nonBigNumberInterception, numeralNumber } from '@/utils/tools'

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
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const openingParams = usePositionOperationStore((state) => state.openingParams)
  const updateOpeningParams = usePositionOperationStore((state) => state.updateOpeningParams)

  const positionVolume = useMemo(
    () => nonBigNumberInterception(bnMul(data.spotPrice, data.size), data.decimals),
    [data]
  )

  const priceChangeRate = useMemo(() => {
    if (marginIndicators) {
      const findKey = Object.keys(marginIndicators).find((m) => getAddress(m) === getAddress(data.token))
      const value = findKey ? marginIndicators[findKey]?.price_change_rate ?? 0 : 0
      return bnMul(value, 100)
    }
    return '0'
  }, [data, marginIndicators])

  const closeableAmount = useMemo(
    () => (Number(data.size) < 1 ? nonBigNumberInterception(data.size, 8) : numeralNumber(data.size, 2)),
    [data]
  )

  useEffect(() => {
    if (visible) updateOpeningParams({ closingAmount: positionVolume })
  }, [visible, positionVolume])

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
                  <strong>{data.name}</strong>
                  <MultipleStatus multiple={data.leverage} direction={PositionSideTypes[data.side] as any} />
                </h4>
              </header>
              <section className="web-trade-dialog-position-info-data">
                <BalanceShow
                  value={data.spotPrice}
                  unit=""
                  decimal={Number(data.spotPrice) === 0 ? 2 : data.decimals}
                />
                <span className={isGTET(priceChangeRate, 0) ? 'buy' : 'sell'}>{keepDecimals(priceChangeRate, 2)}%</span>
              </section>
              <section className="web-trade-dialog-position-info-count">
                <p>
                  {t('Trade.ClosePosition.PositionAveragePrice', 'Position Average Price')} :{' '}
                  <em>
                    {keepDecimals(
                      formatUnits(data.averagePrice, data.pricePrecision),
                      Number(data.averagePrice) === 0 ? 2 : data.decimals
                    )}
                  </em>{' '}
                  {VALUATION_TOKEN_SYMBOL}
                </p>
                <p>
                  {/*const output = Number(size) < 1 ? nonBigNumberInterception(size, 8) : numeralNumber(size, 2)*/}
                  {t('Trade.ClosePosition.PositionCloseable', 'Position Closeable')} : <em>{closeableAmount}</em>{' '}
                  {data.quoteToken} / <em>{numeralNumber(positionVolume, marginToken.decimals)}</em>{' '}
                  {marginToken.symbol}
                </p>
              </section>
            </div>
            <QuantityInput
              value={openingParams.closingAmount}
              maxSwap={positionVolume}
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
