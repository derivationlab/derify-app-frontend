import classNames from 'classnames'
import PubSub from 'pubsub-js'
import { useSigner } from 'wagmi'

import React, { FC, useMemo, useState, useCallback } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useClearingParams } from '@/hooks/useClearingParams'
import { usePositionOperation } from '@/hooks/usePositionOperation'
import PreviewDialog from '@/pages/web/Trade/Dialogs/PositionClose'
import ConfirmDialog from '@/pages/web/Trade/Dialogs/PositionClose/Confirm'
import PnLDialog from '@/pages/web/Trade/Dialogs/TakeProfitAndStopLoss'
import {
  useBrokerInfoStore,
  useMarginTokenStore,
  usePositionOperationStore,
  useProtocolConfigStore,
  useTokenSpotPricesStore,
  useTraderVariablesStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { PositionSideTypes, PubSubEvents, Rec } from '@/typings'
import {
  bnDiv,
  bnMinus,
  bnMul,
  isGT,
  isGTET,
  isLTET,
  keepDecimals,
  nonBigNumberInterception,
  numeralNumber
} from '@/utils/tools'

import AtomWrap from '../c/AtomWrap'
import DataAtom from '../c/DataAtom'
import EditButton from '../c/EditButton'
import ItemHeader from '../c/ItemHeader'
import Reminder from '../c/Reminder'

interface Props {
  data: Record<string, any>
}

const riseOrFall = (data: string): string => (isGT(data, 0) ? '+' : '')

const MyPositionListItem: FC<Props> = ({ data }) => {
  const { t } = useTranslation()
  const { data: signer } = useSigner()

  const [modalType, setModalType] = useState<string>()
  const variables = useTraderVariablesStore((state) => state.variables)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const variablesLoaded = useTraderVariablesStore((state) => state.variablesLoaded)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPricesForPosition)
  const openingParams = usePositionOperationStore((state) => state.openingParams)
  const { clearingParams } = useClearingParams(protocolConfig?.clearing)
  const { closePosition, takeProfitOrStopLoss } = usePositionOperation()

  const tokenSpotPrice = useMemo(() => {
    if (tokenSpotPrices) {
      const find = tokenSpotPrices.find((t: Rec) => t.name === data.name)
      return find?.price ?? '0'
    }
    return '0'
  }, [data, tokenSpotPrices])

  const memoMargin = useMemo(() => {
    return bnDiv(bnMul(data.size, tokenSpotPrice), data.leverage)
  }, [data, tokenSpotPrice])

  const memoVolume = useMemo(() => {
    return bnMul(data.size, tokenSpotPrice)
  }, [data, tokenSpotPrice])

  const memoPnL = useMemo(() => {
    if (isGT(tokenSpotPrice, 0) && isGT(data.size, 0) && isGT(data.averagePrice, 0)) {
      const p1 = bnMinus(tokenSpotPrice, data.averagePrice)
      const p2 = bnMul(p1, data.size)
      const p3 = data.side === PositionSideTypes.long ? 1 : -1
      return bnMul(p2, p3)
    }
    return '0'
  }, [data, tokenSpotPrice])

  const memoRate = useMemo(() => {
    return isGT(memoMargin, 0) ? bnDiv(memoPnL, memoMargin) : '0'
  }, [memoPnL, memoMargin])

  const atom1Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.MyPosition.UnrealizedPnL', 'Unrealized PnL')}
        tip={t('Trade.MyPosition.UnrealizedPnLTip')}
        footer={marginToken.symbol}
      >
        <span className={classNames(`${riseOrFall(memoPnL) ? 'up' : 'down'}`)}>
          {riseOrFall(memoPnL)}
          {numeralNumber(memoPnL, marginToken.decimals)} ({riseOrFall(memoRate)}
          {numeralNumber(bnMul(memoRate, 100), 2)}%)
        </span>
      </DataAtom>
    )
  }, [t, memoPnL, memoRate, marginToken])

  const atom2Tsx = useMemo(() => {
    const size = data?.size ?? 0
    const output = Number(size) < 1 ? nonBigNumberInterception(size, 8) : numeralNumber(size, 2)
    return (
      <DataAtom
        label={t('Trade.MyPosition.Volume', 'Volume')}
        tip={t('Trade.MyPosition.VolumeTip')}
        footer={`${data.quoteToken} / ${marginToken.symbol}`}
      >
        <span>
          {output} / {numeralNumber(memoVolume, marginToken.decimals)}
        </span>
      </DataAtom>
    )
  }, [t, data, memoVolume, marginToken])

  const atom3Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.MyPosition.AvgPrice', 'Avg. Price')}
        tip={t('Trade.MyPosition.AvgPriceTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        <span>{keepDecimals(data?.averagePrice ?? 0, data.decimals)}</span>
      </DataAtom>
    )
  }, [t, data?.averagePrice, data.decimals])

  const atom4Tsx = useMemo(() => {
    let liqPrice
    if (variablesLoaded) {
      const { marginBalance = 0, totalPositionAmount = 0 } = variables
      const mul = data.side === PositionSideTypes.short ? -1 : 1

      const p1 = bnMul(totalPositionAmount, clearingParams.marginMaintenanceRatio)
      const p2 = bnMinus(marginBalance, p1)
      const p3 = bnDiv(p2, data.size)
      const p4 = bnMul(p3, mul)
      const p5 = bnMinus(tokenSpotPrice, p4)
      liqPrice = isLTET(p5, 0) ? '--' : keepDecimals(p5, data.decimals)
    } else {
      liqPrice = '--'
    }

    return (
      <DataAtom
        label={t('Trade.MyPosition.LiqPrice', 'Liq. Price')}
        tip={t('Trade.MyPosition.LiqPriceTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        <span>{liqPrice}</span>
      </DataAtom>
    )
  }, [t, data, data.decimals, clearingParams, variables, tokenSpotPrice, variablesLoaded])

  const atom5Tsx = useMemo(() => {
    return (
      <DataAtom
        label={t('Trade.MyPosition.Margin', 'Margin')}
        tip={t('Trade.MyPosition.MarginTip')}
        footer={marginToken.symbol}
      >
        <span>{numeralNumber(memoMargin, marginToken.decimals)}</span>
      </DataAtom>
    )
  }, [marginToken, memoMargin, t])

  const atom6Tsx = useMemo(() => {
    let alertLevel = 0
    if (isGT(variables.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 5))) alertLevel = 0
    else if (isGT(variables.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 4))) alertLevel = 1
    else if (isGT(variables.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 3))) alertLevel = 2
    else if (isGT(variables.marginRate, bnMul(clearingParams.marginMaintenanceRatio, 2))) alertLevel = 3
    else if (isGT(variables.marginRate, clearingParams.marginMaintenanceRatio)) alertLevel = 4
    else alertLevel = 5

    return (
      <DataAtom
        hover
        label={t('Trade.MyPosition.MarginRate', 'Margin Rate')}
        tip={t('Trade.MyPosition.MarginRateTip', { Ratio: bnMul(clearingParams.marginMaintenanceRatio, 100) })}
      >
        <span className={classNames('reminder', `${Number(variables.marginRate) >= 0 ? 'up' : 'down'}`)}>
          {riseOrFall(variables.marginRate as any)}
          {numeralNumber(Number(variables.marginRate) * 100, 2)}%
        </span>
        <Reminder alertLevel={alertLevel} />
      </DataAtom>
    )
  }, [t, variables.marginRate, clearingParams.marginMaintenanceRatio])

  const atom7Tsx = useMemo(() => {
    const price = data?.takeProfitPrice !== '--' ? keepDecimals(data.takeProfitPrice, data.decimals) : '--'
    return (
      <DataAtom
        label={t('Trade.MyPosition.TakeProfit', 'Take Profit')}
        tip={t('Trade.MyPosition.TakeProfitTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        {price} <EditButton onClick={() => setModalType('PNL_POSITION')} />
      </DataAtom>
    )
  }, [t, data, data.decimals])

  const atom8Tsx = useMemo(() => {
    const price = data?.stopLossPrice !== '--' ? keepDecimals(data.stopLossPrice, data.decimals) : '--'
    return (
      <DataAtom
        label={t('Trade.MyPosition.StopLoss', 'Stop Loss')}
        tip={t('Trade.MyPosition.StopLossTip')}
        footer={VALUATION_TOKEN_SYMBOL}
      >
        {price} <EditButton onClick={() => setModalType('PNL_POSITION')} />
      </DataAtom>
    )
  }, [t, data, data.decimals])

  const disabled = useMemo(
    () => !signer || !brokerBound?.broker || !protocolConfig,
    [signer, protocolConfig, brokerBound]
  )

  const isFullSize = useCallback(
    ({ size = 0 }, amount: string): boolean => {
      const _ = nonBigNumberInterception(bnMul(tokenSpotPrice, size), marginToken.decimals)
      return isGTET(amount, _)
    },
    [tokenSpotPrice, marginToken]
  )

  const closePositionFunc = async () => {
    setModalType('')
    const toast = window.toast.loading(t('common.pending'))
    if (!signer || !brokerBound?.broker || !protocolConfig) return window.toast.error(t('common.failed'))
    const { side, size, token } = data
    const { broker } = brokerBound
    const { exchange } = protocolConfig
    const status = await closePosition(
      exchange,
      broker,
      tokenSpotPrice,
      token,
      openingParams.closingAmount,
      size,
      side,
      isFullSize(data, openingParams.closingAmount)
    )
    if (status) {
      window.toast.success(t('common.success'))
      PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
      PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
      PubSub.publish(PubSubEvents.UPDATE_TRADER_VARIABLES)
    } else {
      window.toast.error(t('common.failed'))
    }
    window.toast.dismiss(toast)
  }

  const pnlFunc = async (params: Record<string, any>) => {
    setModalType('')
    const toast = window.toast.loading(t('common.pending'))
    if (!signer) return window.toast.error(t('common.failed'))
    const { side, TP, SL } = params
    const status = await takeProfitOrStopLoss(data.derivative, side, TP, SL)
    if (status) {
      window.toast.success(t('common.success'))
      PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
    } else {
      window.toast.error(t('common.failed'))
    }
    window.toast.dismiss(toast)
  }

  return (
    <>
      <div className="web-trade-data-item">
        <ItemHeader
          symbol={data?.name}
          multiple={data?.leverage}
          direction={PositionSideTypes[data?.side] as any}
          buttonText={t('Trade.MyPosition.Close', 'Close')}
          onButtonClick={() => setModalType('PREVIEW_POSITION')}
        />
        {isMobile ? (
          <>
            <AtomWrap>
              {atom1Tsx}
              {atom2Tsx}
            </AtomWrap>
            <hr />
            <AtomWrap>
              {atom3Tsx}
              {atom4Tsx}
            </AtomWrap>
            <hr />
            <AtomWrap>
              {atom5Tsx}
              {atom6Tsx}
            </AtomWrap>
            <hr />
            <AtomWrap>
              {atom7Tsx}
              {atom8Tsx}
            </AtomWrap>
          </>
        ) : (
          <>
            <AtomWrap>
              {atom1Tsx}
              {atom2Tsx}
              {atom3Tsx}
              {atom4Tsx}
            </AtomWrap>
            <hr />
            <AtomWrap>
              {atom5Tsx}
              {atom6Tsx}
              {atom7Tsx}
              {atom8Tsx}
            </AtomWrap>
          </>
        )}
      </div>
      <PreviewDialog
        data={data}
        visible={modalType === 'PREVIEW_POSITION'}
        onClose={() => setModalType('')}
        onClick={() => setModalType('CONFIRM_POSITION')}
      />
      <ConfirmDialog
        data={data}
        visible={modalType === 'CONFIRM_POSITION'}
        onClose={() => setModalType('')}
        onClick={closePositionFunc}
        disabled={disabled}
      />
      <PnLDialog
        data={data}
        visible={modalType === 'PNL_POSITION'}
        onClose={() => setModalType('')}
        onClick={pnlFunc}
      />
    </>
  )
}

export default MyPositionListItem
