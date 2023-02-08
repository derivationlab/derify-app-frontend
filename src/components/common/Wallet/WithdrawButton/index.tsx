import React, { FC, useState, useCallback } from 'react'
import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'

import Trader from '@/class/Trader'
import { useAppDispatch } from '@/store'
import { setShareMessage } from '@/store/share'
import { getTraderDataAsync } from '@/store/trader'
import { useMatchConfig } from '@/hooks/useMatchConfig'
import { getMyPositionsDataAsync } from '@/store/contract'

import Button from '@/components/common/Button'
import WithdrawDialog from '@/components/common/Wallet/WithdrawButton/Withdraw'

interface Props {
  size?: string
}

const WithdrawButton: FC<Props> = ({ size = 'default' }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { protocolConfig, protocolConfigLoaded } = useMatchConfig()

  const { traderWithdrawMargin } = Trader

  const [dialogStatus, setDialogStatus] = useState<string>('')

  // withdraw
  const onConfirmWithdrawEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (signer && protocolConfigLoaded) {
        const status = await traderWithdrawMargin(signer, amount, protocolConfig.exchange)
        const account = await signer.getAddress()
        if (status) {
          // succeed
          dispatch(getTraderDataAsync({ trader: account, contract: protocolConfig.exchange }))
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
    [signer, protocolConfigLoaded]
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
