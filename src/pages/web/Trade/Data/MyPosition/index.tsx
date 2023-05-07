import PubSub from 'pubsub-js'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useSigner, useAccount } from 'wagmi'
import React, { FC, useState, useMemo, useContext } from 'react'
import { ThemeContext } from '@/providers/Theme'
import { usePositionOperation } from '@/hooks/useTrading'
import { findMarginToken, findToken } from '@/config/tokens'
import { PubSubEvents, QuoteTokenKeys } from '@/typings'
import { useFactoryConf, useProtocolConf } from '@/hooks/useMatchConf'
import { bnMul, isGTET, nonBigNumberInterception } from '@/utils/tools'
import {
  useOpeningStore,
  useBrokerInfoStore,
  usePositionStore,
  useMarginTokenStore,
  useQuoteTokenStore,
  usePairsInfoStore
} from '@/store'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import Loading from '@/components/common/Loading'
import PositionCloseAllDialog from '@/pages/web/Trade/Dialogs/PositionCloseAll'
import PositionClosePreviewDialog from '@/pages/web/Trade/Dialogs/PositionClose'
import PositionCloseConfirmDialog from '@/pages/web/Trade/Dialogs/PositionClose/Confirm'
import TakeProfitAndStopLossDialog from '@/pages/web/Trade/Dialogs/TakeProfitAndStopLoss'
import ListItem from './ListItem'
import NoRecord from '../c/NoRecord'

const MyPosition: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()

  const { theme } = useContext(ThemeContext)

  const { closePosition, closeAllPositions, takeProfitOrStopLoss } = usePositionOperation()

  const spotPrices = usePairsInfoStore((state) => state.spotPrices)
  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const positionOrd = usePositionStore((state) => state.positionOrd)
  const closingType = useOpeningStore((state) => state.closingType)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const closingAmount = useOpeningStore((state) => state.closingAmount)
  const positionOrdLoaded = usePositionStore((state) => state.loaded)

  const { protocolConfig } = useProtocolConf(marginToken)
  const { match: matchFactoryConfig } = useFactoryConf(marginToken, quoteToken)

  const [targetPosOrd, setTargetPosOrd] = useState<Record<string, any>>({})
  const [dialogStatus, setDialogStatus] = useState<string>('')

  const isFull = ({ size = 0, quoteToken = '' }, amount: string): boolean => {
    const u = nonBigNumberInterception(
      bnMul(spotPrices[marginToken][quoteToken], size),
      findToken(marginToken).decimals
    )
    return findMarginToken(closingType) ? isGTET(amount, u) : isGTET(amount, size)
  }

  const clear = () => setDialogStatus('')

  const preview = (pos: Record<string, any>) => {
    setTargetPosOrd(pos)
    setDialogStatus('preview-close-position')
  }

  const modify = (pos: Record<string, any>) => {
    setTargetPosOrd(pos)
    setDialogStatus('edit-position')
  }

  const _closePosition = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    clear()

    if (signer && brokerBound?.broker && protocolConfig) {
      const { side, size, quoteToken } = targetPosOrd
      const status = await closePosition(
        protocolConfig.exchange,
        brokerBound.broker,
        spotPrices[marginToken][quoteToken],
        quoteToken,
        closingType,
        closingAmount,
        size,
        side,
        isFull(targetPosOrd, closingAmount)
      )

      if (status) {
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
      } else {
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const _closeAllPositions = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    clear()

    if (brokerBound?.broker && protocolConfig) {
      const status = await closeAllPositions(protocolConfig.exchange, brokerBound.broker)

      if (status) {
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
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

    clear()

    if (signer && matchFactoryConfig) {
      const { token, side, TP, SL } = params
      const status = await takeProfitOrStopLoss(matchFactoryConfig[token as QuoteTokenKeys], side, TP, SL)

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
    if (!positionOrdLoaded) return <Loading show type="section" />
    if (!isEmpty(positionOrd)) {
      return (
        <>
          <div className="web-trade-data-list">
            {positionOrd.map((d, i) => (
              <ListItem key={`my-positions-${i}`} data={d} onEdit={modify} onClick={preview} />
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
  }, [theme, address, positionOrd, positionOrdLoaded])

  return (
    <>
      <div className="web-trade-data-wrap">{positions}</div>

      {dialogStatus === 'preview-close-position' && (
        <PositionClosePreviewDialog
          data={targetPosOrd}
          visible={dialogStatus === 'preview-close-position'}
          onClose={clear}
          onClick={() => setDialogStatus('confirm-close-position')}
        />
      )}
      {dialogStatus === 'confirm-close-position' && (
        <PositionCloseConfirmDialog
          data={targetPosOrd}
          visible={dialogStatus === 'confirm-close-position'}
          onClose={clear}
          onClick={_closePosition}
        />
      )}
      {dialogStatus === 'edit-position' && (
        <TakeProfitAndStopLossDialog
          data={targetPosOrd}
          visible={dialogStatus === 'edit-position'}
          onClose={clear}
          onClick={_takeProfitOrStopLoss}
        />
      )}
      {dialogStatus === 'close-all-position' && (
        <PositionCloseAllDialog
          visible={dialogStatus === 'close-all-position'}
          onClose={clear}
          onClick={_closeAllPositions}
        />
      )}
    </>
  )
}

export default MyPosition
