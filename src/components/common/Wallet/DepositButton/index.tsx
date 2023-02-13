import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useCallback } from 'react'

import Trader from '@/class/Trader'
import { useAppDispatch } from '@/store'
import { useMatchConfig } from '@/hooks/useMatchConfig'
import { setShareMessage } from '@/store/share'
import { getTraderDataAsync } from '@/store/trader'
import { getMyPositionsDataAsync } from '@/store/contract'

import Button from '@/components/common/Button'
import DepositDialog from '@/components/common/Wallet/DepositButton/Deposit'
import { useTokenBalances } from '@/zustand'

interface Props {
  size?: string
}

const DepositButton: FC<Props> = ({ size = 'default' }) => {
  const dispatch = useAppDispatch()

  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { protocolConfig, protocolConfigLoaded, marginToken } = useMatchConfig()

  const { traderDepositMargin } = Trader

  const fetchBalances = useTokenBalances((state) => state.fetch)

  const [dialogStatus, setDialogStatus] = useState<string>('')

  // deposit
  const onConfirmDepositEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (signer && protocolConfigLoaded) {
        const account = await signer.getAddress()
        const status = await traderDepositMargin(signer, account, amount, protocolConfig.exchange, marginToken)
        if (status) {
          // succeed
          window.toast.success(t('common.success', 'success'))

          dispatch(getTraderDataAsync({ trader: account, contract: protocolConfig.exchange }))
          dispatch(getMyPositionsDataAsync(account))
          dispatch(setShareMessage({ type: 'MAX_VOLUME_UPDATE' }))

          await fetchBalances(account)
        } else {
          // fail
          window.toast.error(t('common.failed', 'failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [signer, protocolConfig, protocolConfigLoaded, marginToken]
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
