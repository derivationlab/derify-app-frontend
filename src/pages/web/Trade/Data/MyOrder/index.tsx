import PubSub from 'pubsub-js'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useState, useContext } from 'react'

import { ThemeContext } from '@/providers/Theme'
import { usePosDATStore } from '@/store/usePosDAT'
import { useMarginToken } from '@/store'
import { usePositionOperation } from '@/hooks/useTrading'
import { PubSubEvents, QuoteTokenKeys } from '@/typings'
import { useFactoryConf, useProtocolConf } from '@/hooks/useMatchConf'

import CancelOrderDialog from '@/pages/web/Trade/Dialogs/CancelOrder'
import CancelAllOrderDialog from '@/pages/web/Trade/Dialogs/CancelAllOrder'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import Loading from '@/components/common/Loading'
import ListItem from './ListItem'
import NoRecord from '../c/NoRecord'

const MyOrder: FC = () => {
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)
  const { address } = useAccount()

  const marginToken = useMarginToken((state) => state.marginToken)
  const profitLossOrd = usePosDATStore((state) => state.profitLossOrd)
  const profitLossOrdLoaded = usePosDATStore((state) => state.loaded)

  const { cancelPosition } = usePositionOperation()
  const { protocolConfig } = useProtocolConf(marginToken)
  const { match: matchFactoryConfig } = useFactoryConf('', marginToken)
  const { cancelAllPositions } = usePositionOperation()

  const [targetPosOrd, setTargetPosOrd] = useState<Record<string, any>>({})
  const [dialogStatus, setDialogStatus] = useState<string>('')

  const onCloseDialogEv = () => setDialogStatus('')

  const cancelOnePosOrderFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (matchFactoryConfig) {
      const { side, orderType, timestamp, quoteToken } = targetPosOrd

      const status = await cancelPosition(matchFactoryConfig[quoteToken as QuoteTokenKeys], orderType, side, timestamp)

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

  const cancelAllPosOrdersFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (protocolConfig) {
      const status = await cancelAllPositions(protocolConfig.exchange)

      if (status) {
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_TRADE_HISTORY)
        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
      } else {
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const confirmCancelOnePosOrderEv = (order: Record<string, any>) => {
    setTargetPosOrd(order)
    setDialogStatus('cancel-one-position')
  }

  const memoMyPosOrders = useMemo(() => {
    if (!address) return <NoRecord show />
    if (!profitLossOrdLoaded) return <Loading show type="section" />
    if (!isEmpty(profitLossOrd)) {
      return (
        <>
          <div className="web-trade-data-list">
            {profitLossOrd.map((d, i) => (
              <ListItem key={`my-orders-${i}`} data={d} onClick={() => confirmCancelOnePosOrderEv(d)} />
            ))}
          </div>
          <Button onClick={() => setDialogStatus('cancel-all-position')}>
            {t('Trade.MyOrder.CancelAll', 'CANCEL ALL')}
            <Image src={`icon/cancelPosition-white${theme === 'Dark' ? '-dark' : ''}.svg`} />
          </Button>
        </>
      )
    }
    return <NoRecord show />
  }, [address, profitLossOrdLoaded, profitLossOrd, theme])

  return (
    <>
      <div className="web-trade-data-wrap">{memoMyPosOrders}</div>
      <CancelOrderDialog
        visible={dialogStatus === 'cancel-one-position'}
        onClose={onCloseDialogEv}
        onClick={cancelOnePosOrderFunc}
      />
      <CancelAllOrderDialog
        visible={dialogStatus === 'cancel-all-position'}
        onClose={onCloseDialogEv}
        onClick={cancelAllPosOrdersFunc}
      />
    </>
  )
}

export default MyOrder
