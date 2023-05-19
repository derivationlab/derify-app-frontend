import PubSub from 'pubsub-js'
import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useCallback, useMemo } from 'react'

import { PubSubEvents } from '@/typings'
import { useMarginTokenStore } from '@/store'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useMarginOperation } from '@/hooks/useTrading'

import Button from '@/components/common/Button'
import DepositDialog from '@/components/common/Wallet/DepositButton/Deposit'
import { useMarginTokenListStore } from '@/store/useMarginTokenList'

interface Props {
  size?: string
}

const DepositButton: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()
  const { data: signer } = useSigner()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const marginTokenListLoaded = useMarginTokenListStore((state) => state.marginTokenListLoaded)

  const { deposit } = useMarginOperation()
  const { protocolConfig } = useProtocolConf(marginToken)

  const [dialogStatus, setDialogStatus] = useState<string>('')

  const isDisabled = useMemo(() => {
    if (marginTokenListLoaded) {
      const find = marginTokenList.find((margin) => margin.symbol === marginToken)
      return !find
    }
    return true
  }, [marginToken, marginTokenListLoaded])

  // deposit
  const onConfirmDepositEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (protocolConfig) {
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
      <Button size={size} onClick={() => setDialogStatus('deposit')} disabled={isDisabled}>
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
