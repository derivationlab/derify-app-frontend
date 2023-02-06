import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useState, useCallback } from 'react'

import Trader from '@/class/Trader'
import { useAppDispatch } from '@/store'
import { setShareMessage } from '@/store/share'
import { getTraderDataAsync } from '@/store/trader'
import { useMarginInfo } from '@/hooks/useMarginInfo'
import { getMyPositionsDataAsync } from '@/store/contract'

import Button from '@/components/common/Button'
import DepositDialog from '@/components/common/Wallet/DepositButton/Deposit'

interface Props {
  size?: string
}

const DepositButton: FC<Props> = ({ size = 'default' }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { traderDepositMargin } = Trader
  const { config, loaded, marginToken } = useMarginInfo()

  const [dialogStatus, setDialogStatus] = useState<string>('')

  // deposit
  const onConfirmDepositEv = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setDialogStatus('')

      if (signer && loaded) {
        const account = await signer.getAddress()
        const status = await traderDepositMargin(signer, account, amount, config.derifyExchange, marginToken)
        if (status) {
          // succeed
          dispatch(getTraderDataAsync({ trader: account, contract: config.derifyExchange }))
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
    [signer, loaded]
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
