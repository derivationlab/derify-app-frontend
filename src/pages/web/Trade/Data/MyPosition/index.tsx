import PubSub from 'pubsub-js'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useSigner, useAccount } from 'wagmi'
import React, { FC, useState, useMemo, useContext } from 'react'

import Trader from '@/class/Trader'
import ThemeContext from '@/context/Theme/Context'
import { PubSubEvents } from '@/typings'
import { useTraderData } from '@/store/trader/hooks'
import { usePosDATStore } from '@/zustand/usePosDAT'
import { useCalcOpeningDAT } from '@/zustand/useCalcOpeningDAT'
import { useCloseAllPositions, useTakeProfitOrStopLoss } from '@/hooks/useTrading'
import { useMatchConf } from '@/hooks/useMatchConf'

import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import Loading from '@/components/common/Loading'

import PositionCloseAllDialog from '@/pages/web/Trade/Dialogs/PositionCloseAll'
import PositionClosePreviewDialog from '@/pages/web/Trade/Dialogs/PositionClose'
import PositionCloseConfirmDialog from '@/pages/web/Trade/Dialogs/PositionClose/Confirm'
import TakeProfitAndStopLossDialog from '@/pages/web/Trade/Dialogs/TakeProfitAndStopLoss'

import ListItem from './ListItem'
import NoRecord from '../c/NoRecord'
import { isET } from '@/utils/tools'

const MyPosition: FC = () => {
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)
  const { data: signer } = useSigner()
  const { data: account } = useAccount()
  const { brokerBound: broker } = useTraderData()

  const { close } = useCloseAllPositions()
  const { takeProfitOrStopLoss } = useTakeProfitOrStopLoss()
  const { factoryConfig, protocolConfig, spotPrice, marginToken, quoteToken } = useMatchConf()
  const positionOrd = usePosDATStore((state) => state.positionOrd)
  const positionOrdLoaded = usePosDATStore((state) => state.loaded)
  const closingType = useCalcOpeningDAT((state) => state.closingType)
  const closingAmount = useCalcOpeningDAT((state) => state.closingAmount)

  const { closeSomePosition } = Trader

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
  const whetherStud = ({ size = 0, volume = 0 }, amount: number): boolean => {
    return isET(amount, volume) || isET(amount, size)
  }

  const closeOnePositionsFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer && broker?.broker && protocolConfig) {
      const { token, side, size } = targetPosOrd

      const status = await closeSomePosition(
        signer,
        broker.broker,
        closingType,
        token,
        side,
        size,
        closingAmount,
        spotPrice,
        whetherStud(targetPosOrd, closingAmount)
      )

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }
    }

    window.toast.dismiss(toast)
  }

  const closeAllPositionsFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (broker?.broker && protocolConfig) {
      const status = await close(broker.broker, protocolConfig.exchange)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_AMOUNT)
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }
    }

    window.toast.dismiss(toast)
  }

  const takeProfitOrStopLossFunc = async (params: Record<string, any>) => {
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
        onClick={closeOnePositionsFunc}
      />
      <TakeProfitAndStopLossDialog
        data={targetPosOrd}
        visible={dialogStatus === 'edit-position'}
        onClose={onCloseDialogEv}
        onClick={takeProfitOrStopLossFunc}
      />
      <PositionCloseAllDialog
        visible={dialogStatus === 'close-all-position'}
        onClose={onCloseDialogEv}
        onClick={closeAllPositionsFunc}
      />
    </>
  )
}

export default MyPosition
