import PubSub from 'pubsub-js'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useCallback } from 'react'

import { PubSubEvents } from '@/typings'
import { useMarginToken } from '@/store'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useWithdrawMargin } from '@/hooks/useTrading'

import Button from '@/components/common/Button'
import WithdrawDialog from '@/components/common/Wallet/WithdrawButton/Withdraw'

interface Props {
  size?: string
}

const WithdrawButton: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()

  const marginToken = useMarginToken((state) => state.marginToken)

  const { withdraw } = useWithdrawMargin()
  const { protocolConfig } = useProtocolConf(marginToken)

  const [dialogStatus, setDialogStatus] = useState<string>('')

  // withdraw
  const onConfirmWithdrawEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (protocolConfig) {
        const status = await withdraw(protocolConfig.exchange, amount)
        if (status) {
          // succeed
          window.toast.success(t('common.success', 'success'))

          PubSub.publish(PubSubEvents.UPDATE_BALANCE)
          PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
          PubSub.publish(PubSubEvents.UPDATE_TRADER_VARIABLES)
        } else {
          // fail
          window.toast.error(t('common.failed', 'failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [protocolConfig]
  )
  return (
    <>
      <Button size={size} outline onClick={() => setDialogStatus('withdraw')}>
        {t('Nav.Account.Withdraw', 'Withdraw')}
      </Button>
      <WithdrawDialog
        visible={dialogStatus === 'withdraw'}
        onClose={() => setDialogStatus('')}
        onClick={onConfirmWithdrawEv}
      />
    </>
  )
}

export default WithdrawButton
