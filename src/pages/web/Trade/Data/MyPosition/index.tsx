import PubSub from 'pubsub-js'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useSigner, useAccount } from 'wagmi'
import React, { FC, useState, useMemo, useContext } from 'react'

import ThemeContext from '@/context/Theme/Context'
import { useMatchConf } from '@/hooks/useMatchConf'
import { PubSubEvents } from '@/typings'
import { useTraderData } from '@/store/trader/hooks'
import { usePosDATStore } from '@/zustand/usePosDAT'
import { useCalcOpeningDAT } from '@/zustand/useCalcOpeningDAT'
import { isET, nonBigNumberInterception } from '@/utils/tools'
import { useCloseAllPositions, useClosePosition, useTakeProfitOrStopLoss } from '@/hooks/useTrading'

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
  const { theme } = useContext(ThemeContext)
  const { data: signer } = useSigner()
  const { data: account } = useAccount()
  const { brokerBound: broker } = useTraderData()

  const { close: close1 } = useClosePosition()
  const { close: close2 } = useCloseAllPositions()
  const { takeProfitOrStopLoss } = useTakeProfitOrStopLoss()
  const { factoryConfig, protocolConfig, spotPrice, quoteToken } = useMatchConf()
  const positionOrd = usePosDATStore((state) => state.positionOrd)
  const positionOrdLoaded = usePosDATStore((state) => state.loaded)
  const closingType = useCalcOpeningDAT((state) => state.closingType)
  const closingAmount = useCalcOpeningDAT((state) => state.closingAmount)

  const [targetPosOrd, setTargetPosOrd] = useState<Record<string, any>>({})
  const [dialogStatus, setDialogStatus] = useState<string>('')

  const onCloseDialogEv = () => setDialogStatus('')

  const previewPositionInfoEv = (pos: Record<string, any>) => {
    setTargetPosOrd(pos)
    setDialogStatus('preview-close-position')
  }

  const editPositionTriggerEv = (pos: Record<string, any>) => {
    setTargetPosOrd(pos)
    setDialogStatus('edit-position')
  }

  // 100% or not
  const whetherStud = ({ size = 0 }, amount: number): boolean => {
    return isET(amount, nonBigNumberInterception(Number(spotPrice) * size, 8)) || isET(amount, size)
  }

  const closeOneFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer && broker?.broker && protocolConfig) {
      const { side, size } = targetPosOrd

      const status = await close1(
        protocolConfig.exchange,
        broker.broker,
        spotPrice,
        quoteToken,
        closingType,
        size,
        side,
        whetherStud(targetPosOrd, closingAmount)
      )

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }
    }

    window.toast.dismiss(toast)
  }

  const closeAllFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (broker?.broker && protocolConfig) {
      const status = await close2(protocolConfig.exchange, broker.broker)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_AMOUNT)
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }
    }

    window.toast.dismiss(toast)
  }

  const profitOrLossFunc = async (params: Record<string, any>) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer && factoryConfig) {
      const { side, TP, SL } = params

      const status = await takeProfitOrStopLoss(factoryConfig, side, TP, SL)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }
    }

    window.toast.dismiss(toast)
  }

  const memoMyPositions = useMemo(() => {
    if (!account?.address) return <NoRecord show />
    if (!positionOrdLoaded) return <Loading show type="section" />
    if (!isEmpty(positionOrd)) {
      return (
        <>
          <div className="web-trade-data-list">
            {positionOrd.map((d, i) => (
              <ListItem
                key={`my-positions-${i}`}
                data={d}
                onEdit={editPositionTriggerEv}
                onClick={previewPositionInfoEv}
              />
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
  }, [account?.address, positionOrdLoaded, positionOrd, theme])

  return (
    <>
      <div className="web-trade-data-wrap">{memoMyPositions}</div>

      <PositionClosePreviewDialog
        data={targetPosOrd}
        visible={dialogStatus === 'preview-close-position'}
        onClose={onCloseDialogEv}
        onClick={() => setDialogStatus('confirm-close-position')}
      />
      <PositionCloseConfirmDialog
        data={targetPosOrd}
        visible={dialogStatus === 'confirm-close-position'}
        onClose={onCloseDialogEv}
        onClick={closeOneFunc}
      />
      <TakeProfitAndStopLossDialog
        data={targetPosOrd}
        visible={dialogStatus === 'edit-position'}
        onClose={onCloseDialogEv}
        onClick={profitOrLossFunc}
      />
      <PositionCloseAllDialog
        visible={dialogStatus === 'close-all-position'}
        onClose={onCloseDialogEv}
        onClick={closeAllFunc}
      />
    </>
  )
}

export default MyPosition
