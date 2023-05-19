import PubSub from 'pubsub-js'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useState, useContext } from 'react'
import { ThemeContext } from '@/providers/Theme'
import { PubSubEvents } from '@/typings'
import { usePositionStore } from '@/store/usePosition'
import { usePositionOperation } from '@/hooks/useTrading'
import { useDerivativeListStore, useProtocolConfigStore } from '@/store'
import CancelOrderDialog from '@/pages/web/Trade/Dialogs/CancelOrder'
import CancelAllOrderDialog from '@/pages/web/Trade/Dialogs/CancelAllOrder'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import Spinner from '@/components/common/Spinner'
import ListItem from './ListItem'
import NoRecord from '../c/NoRecord'

const MyOrder: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { theme } = useContext(ThemeContext)
  const { cancelAllPositions, cancelPosition } = usePositionOperation()

  const profitLossOrd = usePositionStore((state) => state.profitLossOrd)
  const profitLossOrdLoaded = usePositionStore((state) => state.loaded)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)

  const [targetPosOrd, setTargetPosOrd] = useState<Record<string, any>>({})
  const [dialogStatus, setDialogStatus] = useState<string>('')

  const clear = () => setDialogStatus('')

  const cancel = (order: Record<string, any>) => {
    setTargetPosOrd(order)
    setDialogStatus('cancel-one-position')
  }

  const _cancelPosition = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    clear()

    if (derAddressList) {
      const { side, orderType, timestamp, derivative } = targetPosOrd

      const status = await cancelPosition(derAddressList[derivative], orderType, side, timestamp)

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

  const _cancelAllPositions = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    clear()

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

  const positions = useMemo(() => {
    if (!address) return <NoRecord show />
    if (!profitLossOrdLoaded) return <Spinner absolute />
    if (!isEmpty(profitLossOrd)) {
      return (
        <>
          <div className="web-trade-data-list">
            {profitLossOrd.map((d, i) => (
              <ListItem key={`my-orders-${i}`} data={d} onClick={() => cancel(d)} />
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
      <div className="web-trade-data-wrap">{positions}</div>
      <CancelOrderDialog visible={dialogStatus === 'cancel-one-position'} onClose={clear} onClick={_cancelPosition} />
      <CancelAllOrderDialog
        visible={dialogStatus === 'cancel-all-position'}
        onClose={clear}
        onClick={_cancelAllPositions}
      />
    </>
  )
}

export default MyOrder
