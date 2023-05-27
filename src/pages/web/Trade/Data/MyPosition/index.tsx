import { isEmpty } from 'lodash'
import PubSub from 'pubsub-js'
import { useSigner, useAccount } from 'wagmi'

import React, { FC, useState, useMemo, useContext, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import Spinner from '@/components/common/Spinner'
import { usePositionOperation } from '@/hooks/useTrading'
import PositionClosePreviewDialog from '@/pages/web/Trade/Dialogs/PositionClose'
import PositionCloseConfirmDialog from '@/pages/web/Trade/Dialogs/PositionClose/Confirm'
import PositionCloseAllDialog from '@/pages/web/Trade/Dialogs/PositionCloseAll'
import TakeProfitAndStopLossDialog from '@/pages/web/Trade/Dialogs/TakeProfitAndStopLoss'
import { ThemeContext } from '@/providers/Theme'
import {
  useBrokerInfoStore,
  useQuoteTokenStore,
  useTokenSpotPricesStore,
  useProtocolConfigStore,
  useDerivativeListStore,
  usePositionOperationStore
} from '@/store'
import { PubSubEvents, Rec } from '@/typings'
import { bnMul, isGTET, nonBigNumberInterception } from '@/utils/tools'

import NoRecord from '../c/NoRecord'
import ListItem from './ListItem'

const MyPosition: FC<{ data: Rec[]; loaded: boolean }> = ({ data, loaded }) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { theme } = useContext(ThemeContext)
  const { closePosition, closeAllPositions, takeProfitOrStopLoss } = usePositionOperation()

  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const closingType = usePositionOperationStore((state) => state.closingType)
  const closingAmount = usePositionOperationStore((state) => state.closingAmount)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)

  const [targetPosOrd, setTargetPosOrd] = useState<Rec>({})
  const [dialogStatus, setDialogStatus] = useState<string>('')

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[quoteToken.symbol] ?? '0'
  }, [quoteToken, tokenSpotPrices])

  const isFullSize = useCallback(
    ({ size = 0 }, amount: string): boolean => {
      const _ = nonBigNumberInterception(bnMul(spotPrice, size))
      return isGTET(amount, _)
    },
    [spotPrice]
  )

  const clearing = () => setDialogStatus('')

  const changePosition = (pos: Record<string, any>) => {
    setTargetPosOrd(pos)
    setDialogStatus('edit-position')
  }

  const previewPosition = (pos: Record<string, any>) => {
    setTargetPosOrd(pos)
    setDialogStatus('previewPosition-close-position')
  }

  const _closePosition = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    clearing()

    if (signer && brokerBound?.broker && protocolConfig) {
      const { side, size, token } = targetPosOrd
      const { broker } = brokerBound
      const { exchange } = protocolConfig

      const status = await closePosition(
        exchange,
        broker,
        spotPrice,
        token,
        closingType,
        closingAmount,
        size,
        side,
        isFullSize(targetPosOrd, closingAmount)
      )

      if (status) {
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
        PubSub.publish(PubSubEvents.UPDATE_TRADER_VARIABLES)
      } else {
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const _closeAllPositions = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    clearing()

    if (brokerBound?.broker && protocolConfig) {
      const status = await closeAllPositions(protocolConfig.exchange, brokerBound.broker)

      if (status) {
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
      } else {
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const _takeProfitOrStopLoss = async (params: Record<string, any>) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    clearing()

    if (signer && derAddressList) {
      const { side, TP, SL } = params

      const status = await takeProfitOrStopLoss(derAddressList[quoteToken.symbol].derivative, side, TP, SL)

      if (status) {
        window.toast.success(t('common.success', 'success'))
      } else {
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const positions = useMemo(() => {
    if (!address) return <NoRecord show />
    if (loaded) return <Spinner absolute small />
    if (!isEmpty(data)) {
      return (
        <>
          <div className="web-trade-data-list">
            {data.map((d: Rec, i: number) => (
              <ListItem key={`my-positions-${i}`} data={d} onEdit={changePosition} onClick={previewPosition} />
            ))}
          </div>
          <Button onClick={() => setDialogStatus('close-all-position')}>
            {t('Trade.MyPosition.CloseAll', 'CLOSE ALL')}
            <Image src={`icon/close-white${theme === 'Dark' ? '-dark' : ''}.svg`} />
          </Button>
        </>
      )
    }
    return <NoRecord show />
  }, [theme, address, loaded, data])

  return (
    <>
      <div className="web-trade-data-wrap">{positions}</div>

      {dialogStatus === 'previewPosition-close-position' && (
        <PositionClosePreviewDialog
          data={targetPosOrd}
          visible={dialogStatus === 'previewPosition-close-position'}
          onClose={clearing}
          onClick={() => setDialogStatus('confirm-close-position')}
        />
      )}
      {dialogStatus === 'confirm-close-position' && (
        <PositionCloseConfirmDialog
          data={targetPosOrd}
          visible={dialogStatus === 'confirm-close-position'}
          onClose={clearing}
          onClick={_closePosition}
        />
      )}
      {dialogStatus === 'edit-position' && (
        <TakeProfitAndStopLossDialog
          data={targetPosOrd}
          visible={dialogStatus === 'edit-position'}
          onClose={clearing}
          onClick={_takeProfitOrStopLoss}
        />
      )}
      {dialogStatus === 'close-all-position' && (
        <PositionCloseAllDialog
          visible={dialogStatus === 'close-all-position'}
          onClose={clearing}
          onClick={_closeAllPositions}
          loading={!protocolConfig}
        />
      )}
    </>
  )
}

export default MyPosition
