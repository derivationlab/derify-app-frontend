import PubSub from 'pubsub-js'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useState } from 'react'

import { useAddGrant } from '@/hooks/useDashboard'
import { useConfigInfo } from '@/store'
import { MarginTokenKeys, PubSubEvents } from '@/typings'

import AddGrantDialog from './AddGrantDialog'

const AddGrant: FC = () => {
  const { t } = useTranslation()

  const [visible, setVisible] = useState(false)

  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)

  const { addGrantPlan } = useAddGrant()

  const _addGrantPlan = async (token: string, type: string, amount: string, days1: number, days2: number) => {
    setVisible(false)

    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (protocolConfigLoaded && protocolConfig) {
      const config = protocolConfig[token as MarginTokenKeys][type as 'mining' | 'awards' | 'rank']
      const status = await addGrantPlan(type, config, amount, days1, days2)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_BALANCE)
        PubSub.publish(PubSubEvents.UPDATE_GRANT_LIST)
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  return (
    <>
      <div className="web-dashboard-grant-list-add-button" onClick={() => setVisible(true)} />
      <AddGrantDialog visible={visible} onClose={() => setVisible(false)} onConfirm={_addGrantPlan} />
    </>
  )
}

export default AddGrant
