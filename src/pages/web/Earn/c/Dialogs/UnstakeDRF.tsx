import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'

import { useTokenBalance } from '@/hooks/useTokenBalance'
import { getBUSDAddress } from '@/utils/addressHelpers'
import { useTraderData } from '@/store/trader/hooks'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import AmountInput from '@/components/common/Wallet/AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const UnstakeDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { trader } = useTraderData()
  const { data: ACCOUNT } = useAccount()

  const [depositAmount, setDepositAmount] = useState<string>('0')
  const [isDisabled, setIsDisabled] = useState<boolean>(false)

  const memoDisabled = useMemo(() => {
    return new BN(trader?.stakingDRFBalance ?? 0).isGreaterThan(0)
  }, [trader?.stakingDRFBalance])

  const onChangeEv = (v: string) => {
    const _v = new BN(v)
    const _balance = new BN(trader?.stakingDRFBalance ?? 0)
    if (_balance.isGreaterThanOrEqualTo(v) && _v.isGreaterThan(0)) {
      setIsDisabled(false)
      setDepositAmount(v)
    } else {
      setIsDisabled(true)
      setDepositAmount('0')
    }
  }

  return (
    <Dialog width="540px" visible={visible} title={t('Earn.DRFPool.UnstakeDRF', 'Unstake DRF')} onClose={onClose}>
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.DRFPool.StakingAmount', 'Staking Amount')}</dt>
              <dd>
                <BalanceShow value={trader?.stakingDRFBalance ?? 0} unit="DRF" />
              </dd>
            </dl>
            <address>{ACCOUNT?.address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={trader?.stakingDRFBalance ?? 0}
              title={t('Earn.DRFPool.AmountToUnstake', 'Amount to unstake')}
              unit="DRF"
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button onClick={() => onClick(depositAmount)} disabled={!memoDisabled || isDisabled}>
          {t('Earn.DRFPool.Unstake', 'Unstake')}
        </Button>
      </div>
    </Dialog>
  )
}

UnstakeDRFDialog.defaultProps = {}

export default UnstakeDRFDialog
