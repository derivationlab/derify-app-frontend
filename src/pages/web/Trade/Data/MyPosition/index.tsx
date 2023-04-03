import PubSub from 'pubsub-js'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useSigner, useAccount } from 'wagmi'
import React, { FC, useState, useMemo, useContext } from 'react'

import { ThemeContext } from '@/providers/Theme'
import { useBrokerInfo } from '@/store/useBrokerInfo'
import { usePosDATStore } from '@/store/usePosDAT'
import { useCalcOpeningDAT } from '@/store/useCalcOpeningDAT'
import { findMarginToken, findToken } from '@/config/tokens'
import { PubSubEvents, QuoteTokenKeys } from '@/typings'
import { useMarginToken, useQuoteToken } from '@/store'
import { bnMul, isGTET, nonBigNumberInterception } from '@/utils/tools'
import { useFactoryConf, useProtocolConf, useSpotPrice } from '@/hooks/useMatchConf'
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
  const { address } = useAccount()

  const { close: close1 } = useClosePosition()
  const { close: close2 } = useCloseAllPositions()
  const { takeProfitOrStopLoss } = useTakeProfitOrStopLoss()

  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const positionOrd = usePosDATStore((state) => state.positionOrd)
  const closingType = useCalcOpeningDAT((state) => state.closingType)
  const closingAmount = useCalcOpeningDAT((state) => state.closingAmount)
  const positionOrdLoaded = usePosDATStore((state) => state.loaded)
  const marginToken = useMarginToken((state) => state.marginToken)

  const { spotPrices } = useSpotPrice(quoteToken, marginToken)
  const { protocolConfig } = useProtocolConf(marginToken)
  const { match: matchFactoryConfig } = useFactoryConf(quoteToken, marginToken)

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
  const whetherStud = ({ size = 0, quoteToken = '' }, amount: string): boolean => {
    const u = nonBigNumberInterception(bnMul(spotPrices[quoteToken], size), findToken(marginToken).decimals)
    if (findMarginToken(closingType)) return isGTET(amount, u)
    return isGTET(amount, size)
  }

  const closeOneFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer && brokerBound?.broker && protocolConfig) {
      const { side, size, quoteToken } = targetPosOrd
      console.info(
        protocolConfig.exchange,
        brokerBound.broker,
        spotPrices[quoteToken],
        quoteToken,
        closingType,
        closingAmount,
        size,
        side,
        whetherStud(targetPosOrd, closingAmount)
      )
      const status = await close1(
        protocolConfig.exchange,
        brokerBound.broker,
        spotPrices[quoteToken],
        quoteToken,
        closingType,
        closingAmount,
        size,
        side,
        whetherStud(targetPosOrd, closingAmount)
      )

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
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

    if (brokerBound?.broker && protocolConfig) {
      const status = await close2(protocolConfig.exchange, brokerBound.broker)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
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

    if (signer && matchFactoryConfig) {
      const { token, side, TP, SL } = params
      const status = await takeProfitOrStopLoss(matchFactoryConfig[token as QuoteTokenKeys], side, TP, SL)

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
    if (!address) return <NoRecord show />
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
  }, [address, positionOrdLoaded, positionOrd, theme])

  return (
    <>
      <div className="web-trade-data-wrap">{memoMyPositions}</div>

      {dialogStatus === 'preview-close-position' && (
        <PositionClosePreviewDialog
          data={targetPosOrd}
          visible={dialogStatus === 'preview-close-position'}
          onClose={onCloseDialogEv}
          onClick={() => setDialogStatus('confirm-close-position')}
        />
      )}
      {dialogStatus === 'confirm-close-position' && (
        <PositionCloseConfirmDialog
          data={targetPosOrd}
          visible={dialogStatus === 'confirm-close-position'}
          onClose={onCloseDialogEv}
          onClick={closeOneFunc}
        />
      )}
      {dialogStatus === 'edit-position' && (
        <TakeProfitAndStopLossDialog
          data={targetPosOrd}
          visible={dialogStatus === 'edit-position'}
          onClose={onCloseDialogEv}
          onClick={profitOrLossFunc}
        />
      )}
      {dialogStatus === 'close-all-position' && (
        <PositionCloseAllDialog
          visible={dialogStatus === 'close-all-position'}
          onClose={onCloseDialogEv}
          onClick={closeAllFunc}
        />
      )}
    </>
  )
}

export default MyPosition
