import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useCallback } from 'react'

import Button from '@/components/common/Button'
import DepositDialog from '@/components/common/Wallet/DepositButton/Deposit'
import { useTokenBalances } from '@/zustand'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useDepositMargin } from '@/hooks/useTrading'

interface Props {
  size?: string
}

const DepositButton: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()
  const { data } = useAccount()

  const { deposit } = useDepositMargin()
  const { protocolConfig, marginToken } = useProtocolConf()

  const fetchBalances = useTokenBalances((state) => state.fetch)

  const [dialogStatus, setDialogStatus] = useState<string>('')

  // deposit
  const onConfirmDepositEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (data?.address && protocolConfig) {
        const status = await deposit(protocolConfig.exchange, amount, marginToken)

        if (status) {
          // succeed
          window.toast.success(t('common.success', 'success'))

          await fetchBalances(data.address)
        } else {
          // fail
          window.toast.error(t('common.failed', 'failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [data?.address, protocolConfig, marginToken]
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
