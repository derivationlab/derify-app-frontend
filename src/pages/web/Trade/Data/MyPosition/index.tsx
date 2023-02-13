import BN from 'bignumber.js'
import { batch } from 'react-redux'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useSigner, useAccount } from 'wagmi'
import React, { FC, useState, useMemo, useContext } from 'react'

import Trader from '@/class/Trader'
import ThemeContext from '@/context/Theme/Context'
import { useSpotPrice } from '@/hooks/useMatchConf'
import { useTraderData } from '@/store/trader/hooks'
import { useMatchConfig } from '@/hooks/useMatchConfig'
import { usePosDATStore } from '@/zustand/usePosDAT'
import { useAppDispatch } from '@/store'
import { useShareMessage } from '@/store/share/hooks'
import { getTraderDataAsync } from '@/store/trader'
import { getMyPositionsDataAsync } from '@/store/contract'
import { clearShareMessage, setShareMessage } from '@/store/share'

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
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { shareMessage } = useShareMessage()
  const { data: signer } = useSigner()
  const { data: account } = useAccount()
  const { brokerBound: broker } = useTraderData()
  const { protocolConfig, protocolConfigLoaded } = useMatchConfig()

  const { spotPrice } = useSpotPrice()
  const positionOrd = usePosDATStore((state) => state.positionOrd)
  const positionOrdLoaded = usePosDATStore((state) => state.loaded)

  const { closeAllPositions, closeSomePosition, takeProfitOrStopLoss } = Trader

  const { theme } = useContext(ThemeContext)

  const [targetPosOrd, setTargetPosOrd] = useState<Record<string, any>>({})
  const [dialogStatus, setDialogStatus] = useState<string>('')

  const memoShareMessage = useMemo(() => {
    if (!isEmpty(shareMessage) && shareMessage?.type === 'CLOSE_POSITION') {
      return shareMessage
    }
    return {}
  }, [shareMessage])

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
  const whetherStud = ({ size = 0, volume = 0 }, amount: string): boolean => {
    const amount_BN = new BN(amount)
    return amount_BN.isEqualTo(volume) || amount_BN.isEqualTo(size)
  }

  const closeOnePositionsFunc = async () => {
    dispatch(clearShareMessage())

    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer && broker?.broker && protocolConfigLoaded) {
      const { token, side, size } = targetPosOrd
      const { symbol = '', amount = 0 } = memoShareMessage

      const account = await signer.getAddress()
      const status = await closeSomePosition(
        signer,
        broker.broker,
        symbol,
        token,
        side,
        size,
        amount,
        spotPrice,
        whetherStud(targetPosOrd, amount)
      )

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        batch(() => {
          dispatch(getTraderDataAsync({ trader: account, contract: protocolConfig.exchange }))
          dispatch(getMyPositionsDataAsync(account))
          dispatch(setShareMessage({ type: ['MAX_VOLUME_UPDATE', 'UPDATE_TRADE_HISTORY'] }))
        })
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

    if (signer && broker?.broker && protocolConfigLoaded) {
      const account = await signer.getAddress()
      const status = await closeAllPositions(signer, broker.broker)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        batch(() => {
          dispatch(getTraderDataAsync({ trader: account, contract: protocolConfig.exchange }))
          dispatch(getMyPositionsDataAsync(account))
          dispatch(setShareMessage({ type: ['MAX_VOLUME_UPDATE', 'UPDATE_TRADE_HISTORY', 'UPDATE_POSITIONS_AMOUNT'] }))
        })
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

    if (signer && broker?.broker && protocolConfigLoaded) {
      const { token, side, TP, SL } = params

      const account = await signer.getAddress()
      const status = await takeProfitOrStopLoss(signer, token, side, TP, SL)
      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        batch(() => {
          dispatch(getTraderDataAsync({ trader: account, contract: protocolConfig.exchange }))
          dispatch(getMyPositionsDataAsync(account))
          dispatch(setShareMessage({ type: ['MAX_VOLUME_UPDATE', 'UPDATE_POSITIONS_AMOUNT'] }))
        })
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
