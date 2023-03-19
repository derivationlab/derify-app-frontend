import PubSub from 'pubsub-js'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useCallback } from 'react'

import { PubSubEvents } from '@/typings'
import { useMarginToken } from '@/store'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useDepositMargin } from '@/hooks/useTrading'

import Button from '@/components/common/Button'
import DepositDialog from '@/components/common/Wallet/DepositButton/Deposit'

interface Props {
  size?: string
}

const DepositButton: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()

  const marginToken = useMarginToken((state) => state.marginToken)

  const { deposit } = useDepositMargin()
  const { protocolConfig } = useProtocolConf(marginToken)

  const [dialogStatus, setDialogStatus] = useState<string>('')

  // deposit
  const onConfirmDepositEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (protocolConfig) {
        const status = await deposit(protocolConfig.exchange, amount, marginToken)

        if (status) {
          // succeed
          window.toast.success(t('common.success', 'success'))

          PubSub.publish(PubSubEvents.UPDATE_BALANCE)
          PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
        } else {
          // fail
          window.toast.error(t('common.failed', 'failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [protocolConfig, marginToken]
  )

  return (
    <>
      <Button size={size} onClick={() => setDialogStatus('deposit')}>
        {t('Nav.Account.Deposit', 'Deposit')}
      </Button>
      <DepositDialog
        visible={dialogStatus === 'deposit'}
        onClose={() => setDialogStatus('')}
        onClick={onConfirmDepositEv}
      />
    </>
  )
}

export default DepositButton
