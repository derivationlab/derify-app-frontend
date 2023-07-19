import PubSub from 'pubsub-js'
import { useSigner } from 'wagmi'

import React, { FC, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import DepositDialog from '@/components/common/Wallet/DepositButton/Deposit'
import { useMarginOperation } from '@/hooks/useMarginOperation'
import { useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { PubSubEvents } from '@/typings'

interface Props {
  size?: string
}

const DepositButton: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { deposit } = useMarginOperation()
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const [dialogStatus, setDialogStatus] = useState<string>('')

  // deposit
  const onConfirmDepositEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending'))

      setDialogStatus('')

      if (protocolConfig && signer) {
        const status = await deposit(protocolConfig.exchange, amount, marginToken, signer)

        if (status) {
          // succeed
          window.toast.success(t('common.success'))

          PubSub.publish(PubSubEvents.UPDATE_BALANCE)
          PubSub.publish(PubSubEvents.UPDATE_POSITION_VOLUME)
          PubSub.publish(PubSubEvents.UPDATE_TRADER_VARIABLES)
        } else {
          // fail
          window.toast.error(t('common.failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [signer, marginToken, protocolConfig]
  )

  return (
    <>
      <Button size={size} onClick={() => setDialogStatus('deposit')} disabled={!marginToken.open || !protocolConfig}>
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
