import { isEmpty } from 'lodash'
import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import React, { FC, useMemo, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import Spinner from '@/components/common/Spinner'
import { usePositionOperation } from '@/hooks/useTrading'
import CancelAllOrderDialog from '@/pages/web/Trade/Dialogs/CancelAllOrder'
import CancelOrderDialog from '@/pages/web/Trade/Dialogs/CancelOrder'
import { ThemeContext } from '@/providers/Theme'
import { useDerivativeListStore, useProtocolConfigStore } from '@/store'
import { PubSubEvents, Rec } from '@/typings'

import NoRecord from '../c/NoRecord'
import ListItem from './ListItem'

const MyOrder: FC<{ data: Rec[]; loaded: boolean }> = ({ data, loaded }) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { theme } = useContext(ThemeContext)
  const { cancelAllPositions, cancelPosition } = usePositionOperation()

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

      const status = await cancelPosition(derAddressList[derivative].derivative, orderType, side, timestamp)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_TRADER_VARIABLES)
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

        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_TRADER_VARIABLES)
      } else {
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const positions = useMemo(() => {
    if (!address) return <NoRecord show />
    if (!loaded) return <Spinner absolute />
    if (!isEmpty(data)) {
      return (
        <>
          <div className="web-trade-data-list">
            {data.map((d: Rec, i: number) => (
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
  }, [theme, address, loaded, data])

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
