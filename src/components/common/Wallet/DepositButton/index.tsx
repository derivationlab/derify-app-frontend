import PubSub from 'pubsub-js'
import { useSigner } from 'wagmi'

import React, { FC, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import DepositDialog from '@/components/common/Wallet/DepositButton/Deposit'
import { useMarginOperation } from '@/hooks/useMarginOperation'
import { useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { useMarginTokenListStore } from '@/store/useMarginTokenList'
import { PubSubEvents } from '@/typings'

interface Props {
  size?: string
}

const DepositButton: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { deposit } = useMarginOperation()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

  const [dialogStatus, setDialogStatus] = useState<string>('')

  const isDisabled = useMemo(() => {
    if (marginTokenList.length) return !marginTokenList.find((margin) => margin.symbol === marginToken.symbol)?.open
    return true
  }, [marginToken, marginTokenList])

  // deposit
  const onConfirmDepositEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (protocolConfig && signer) {
        const status = await deposit(protocolConfig.exchange, amount, marginToken, signer)

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
    [signer, marginToken, protocolConfig]
  )

  return (
    <>
      <Button size={size} onClick={() => setDialogStatus('deposit')} disabled={isDisabled || !protocolConfig}>
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
