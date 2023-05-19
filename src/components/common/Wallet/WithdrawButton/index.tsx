import PubSub from 'pubsub-js'
import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useCallback } from 'react'

import { PubSubEvents } from '@/typings'
import { useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useMarginOperation } from '@/hooks/useTrading'

import Button from '@/components/common/Button'
import WithdrawDialog from '@/components/common/Wallet/WithdrawButton/Withdraw'

interface Props {
  size?: string
}

const WithdrawButton: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { withdraw } = useMarginOperation()

  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

  const [dialogStatus, setDialogStatus] = useState<string>('')

  // withdraw
  const onConfirmWithdrawEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (protocolConfig && signer) {
        const status = await withdraw(protocolConfig.exchange, amount, signer)
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
    [signer, protocolConfig]
  )
  return (
    <>
      <Button size={size} outline onClick={() => setDialogStatus('withdraw')} disabled={!protocolConfig}>
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
