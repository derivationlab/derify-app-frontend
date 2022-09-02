import React, { FC, useMemo, useState, useContext } from 'react'
import { isEmpty } from 'lodash'
import { batch } from 'react-redux'
import { useSigner, useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'

import Trader from '@/class/Trader'
import ThemeContext from '@/context/Theme/Context'
import { useAppDispatch } from '@/store'
import { setShareMessage } from '@/store/share'
import { getTraderDataAsync } from '@/store/trader'
import { useContractData } from '@/store/contract/hooks'
import { getMyPositionsDataAsync } from '@/store/contract'

import CancelOrderDialog from '@/pages/web/Trade/Dialogs/CancelOrder'
import CancelAllOrderDialog from '@/pages/web/Trade/Dialogs/CancelAllOrder'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import Loading from '@/components/common/Loading'
import ListItem from './ListItem'
import NoRecord from '../c/NoRecord'

const MyOrder: FC = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)
  const { data: signer } = useSigner()
  const { data: account } = useAccount()
  const { myOrders, myOrdersLoaded } = useContractData()
  const { cancelAllPosOrders, cancelSomePosition } = Trader

  const [targetPosOrd, setTargetPosOrd] = useState<Record<string, any>>({})
  const [dialogStatus, setDialogStatus] = useState<string>('')

  const onCloseDialogEv = () => setDialogStatus('')

  const cancelOnePosOrderFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer) {
      const account = await signer.getAddress()
      const status = await cancelSomePosition(
        signer,
        targetPosOrd?.token,
        targetPosOrd?.side,
        targetPosOrd?.orderType,
        targetPosOrd?.timestamp
      )
      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        batch(() => {
          dispatch(getTraderDataAsync(account))
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

  const cancelAllPosOrdersFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer) {
      const account = await signer.getAddress()
      const status = await cancelAllPosOrders(signer)
      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        batch(() => {
          dispatch(getTraderDataAsync(account))
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

  const confirmCancelOnePosOrderEv = (order: Record<string, any>) => {
    setTargetPosOrd(order)
    setDialogStatus('cancel-one-position')
  }

  const memoMyPosOrders = useMemo(() => {
    if (!account?.address) return <NoRecord show />
    if (!myOrdersLoaded) return <Loading show type="section" />
    if (!isEmpty(myOrders ?? [])) {
      return (
        <>
          <div className="web-trade-data-list">
            {myOrders.map((d, i) => (
              <ListItem key={`my-orders-${i}`} data={d} onClick={() => confirmCancelOnePosOrderEv(d)} />
            ))}
          </div>
          <Button onClick={() => setDialogStatus('cancel-all-position')}>
            {t('Trade.MyOrder.CancelAll', 'CANCEL ALL')}
            <Image src={`icon/close-white${theme === 'Dark' ? '-dark' : ''}.svg`} />
          </Button>
        </>
      )
    }
    return <NoRecord show />
  }, [account?.address, myOrdersLoaded, myOrders, theme])

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
