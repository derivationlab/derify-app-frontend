import { useAtomValue } from 'jotai'
import { isEmpty } from 'lodash-es'
import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import React, { FC, useState, useMemo, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { userBrokerBoundAtom } from '@/atoms/useBrokerData'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import Spinner from '@/components/common/Spinner'
import { usePositionOperation } from '@/hooks/usePositionOperation'
import { usePriceDecimalsForTrade, useTokenSpotPricesForTrade } from '@/hooks/useTokenSpotPrices'
import CloseAllDialog from '@/pages/web/Trade/Dialogs/PositionCloseAll'
import { ThemeContext } from '@/providers/Theme'
import { useProtocolConfigStore, useTokenSpotPricesStore } from '@/store'
import { PubSubEvents, Rec } from '@/typings'

import NoRecord from '../c/NoRecord'
import ListItem from './ListItem'

const MyPosition: FC<{ data: Rec[]; loaded: boolean }> = ({ data, loaded }) => {
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)
  const { address } = useAccount()
  const [modalType, setModalType] = useState<string>()
  const userBrokerBound = useAtomValue(userBrokerBoundAtom)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const updateSpotPrices = useTokenSpotPricesStore((state) => state.updateTokenSpotPricesForPosition)
  const { priceDecimals } = usePriceDecimalsForTrade(data)
  const { data: spotPrices, refetch: refetchSpotPrices } = useTokenSpotPricesForTrade(data, priceDecimals)
  const { closeAllPositions } = usePositionOperation()

  const closeAllFunc = async () => {
    setModalType('')
    const toast = window.toast.loading(t('common.pending'))
    if (userBrokerBound?.broker && protocolConfig) {
      const status = await closeAllPositions(protocolConfig.exchange, userBrokerBound.broker)
      if (status) {
        window.toast.success(t('common.success'))
        PubSub.publish(PubSubEvents.UPDATE_OPENED_POSITION)
        PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
      } else {
        window.toast.error(t('common.failed'))
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
              <ListItem key={`my-positions-${i}`} data={{ ...d, pricePrecision: priceDecimals?.[d.pairAddress] }} />
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
  }, [data, theme, loaded, address, priceDecimals])

  useEffect(() => {
    if (spotPrices) updateSpotPrices(spotPrices)
  }, [spotPrices])

  useEffect(() => {
    if (data && priceDecimals) void refetchSpotPrices()
  }, [data, priceDecimals])

  return (
    <>
      <div className="web-trade-data-wrap">{positions}</div>
      <CloseAllDialog
        visible={modalType === 'CLOSE_ALL_POSITIONS'}
        onClose={() => setModalType('')}
        onClick={closeAllFunc}
        disabled={!protocolConfig || !userBrokerBound}
      />
    </>
  )
}

export default MyPosition
