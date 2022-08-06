import React, { FC, useState, useCallback } from 'react'
import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'

import Trader from '@/class/Trader'

import { getTraderDataAsync } from '@/store/trader'
import { useAppDispatch } from '@/store'

import Button from '@/components/common/Button'
import DepositDialog from '@/components/common/Wallet/DepositButton/Deposit'
import { setShareMessage } from '@/store/share'
import { getMyPositionsDataAsync } from '@/store/contract'

interface Props {
  size?: string
}

const DepositButton: FC<Props> = ({ size = 'default' }) => {
  const { t } = useTranslation()
  const [dialogStatus, setDialogStatus] = useState<string>('')
  const dispatch = useAppDispatch()
  const { data: signer } = useSigner()
  const { traderDeposit } = Trader

  // deposit
  const onConfirmDepositEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (signer) {
        const account = await signer.getAddress()
        const status = await traderDeposit(signer, account, amount)
        if (status) {
          // succeed
          dispatch(getTraderDataAsync(account))
          dispatch(getMyPositionsDataAsync(account))
          dispatch(setShareMessage({ type: 'MAX_VOLUME_UPDATE' }))

          window.toast.success(t('common.success', 'success'))
        } else {
          // fail
          window.toast.error(t('common.failed', 'failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [signer]
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
