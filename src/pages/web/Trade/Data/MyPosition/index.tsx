import { isEmpty } from 'lodash'
import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import React, { FC, useState, useMemo, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import Spinner from '@/components/common/Spinner'
import { usePositionOperation } from '@/hooks/usePositionOperation'
import { usePriceDecimals, useTokenSpotPrices } from '@/hooks/useTokenSpotPrices'
import CloseAllDialog from '@/pages/web/Trade/Dialogs/PositionCloseAll'
import { ThemeContext } from '@/providers/Theme'
import { useBrokerInfoStore, useProtocolConfigStore, useTokenSpotPricesStore } from '@/store'
import { PubSubEvents, Rec } from '@/typings'

import NoRecord from '../c/NoRecord'
import ListItem from './ListItem'

const MyPosition: FC<{ data: Rec[]; loaded: boolean }> = ({ data, loaded }) => {
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)
  const { address } = useAccount()
  const { closeAllPositions } = usePositionOperation()
  const [modalType, setModalType] = useState<string>()
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const updateSpotPrices = useTokenSpotPricesStore((state) => state.updateTokenSpotPricesForPosition)
  const { priceDecimals } = usePriceDecimals(data)
  const { data: spotPrices } = useTokenSpotPrices(data, priceDecimals)

  const closeAllFunc = async () => {
    setModalType('')
    const toast = window.toast.loading(t('common.pending', 'pending...'))
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

  const positions = useMemo(() => {
    if (!address) return <NoRecord show />
    if (loaded) return <Spinner absolute small />
    if (!isEmpty(data)) {
      return (
        <>
          <div className="web-trade-data-list">
            {data.map((d: Rec, i: number) => (
              <ListItem key={`my-positions-${i}`} data={d} />
            ))}
          </div>
          <Button onClick={() => setModalType('CLOSE_ALL_POSITIONS')}>
            {t('Trade.MyPosition.CloseAll', 'CLOSE ALL')}
            <Image src={`icon/close-white${theme === 'Dark' ? '-dark' : ''}.svg`} />
          </Button>
        </>
      )
    }
    return <NoRecord show />
  }, [theme, address, loaded, data])

  useEffect(() => {
    if (spotPrices) updateSpotPrices(spotPrices)
  }, [spotPrices])

  return (
    <>
      <div className="web-trade-data-wrap">{positions}</div>
      <CloseAllDialog
        visible={modalType === 'CLOSE_ALL_POSITIONS'}
        onClose={() => setModalType('')}
        onClick={closeAllFunc}
        disabled={!protocolConfig || !brokerBound}
      />
    </>
  )
}

export default MyPosition
