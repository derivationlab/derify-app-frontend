import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'

import { useTokenBalance } from '@/hooks/useTokenBalance'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import AmountInput from '@/components/common/Wallet/AmountInput'
import tokens from '@/config/tokens'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const StakeDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { data: ACCOUNT } = useAccount()
  const { balance } = useTokenBalance(tokens.drf.tokenAddress)

  const [depositAmount, setDepositAmount] = useState<string>('0')
  const [isDisabled, setIsDisabled] = useState<boolean>(false)

  const memoDisabled = useMemo(() => {
    return new BN(balance).isGreaterThan(0)
  }, [balance])

  const onChangeEv = (v: string) => {
    const _v = new BN(v)
    const _balance = new BN(balance)
    if (_balance.isGreaterThanOrEqualTo(v) && _v.isGreaterThan(0)) {
      setIsDisabled(false)
      setDepositAmount(v)
    } else {
      setIsDisabled(true)
      setDepositAmount('0')
    }
  }

  return (
    <Dialog width="540px" visible={visible} title={t('Earn.DRFPool.StakeDRF', 'Stake DRF')} onClose={onClose}>
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.DRFPool.WalletBalance', 'Wallet Balance')}</dt>
              <dd>
                <BalanceShow value={balance} unit="DRF" />
              </dd>
            </dl>
            <address>{ACCOUNT?.address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={balance}
              title={t('Earn.DRFPool.AmountToStake', 'Amount to stake')}
              unit="DRF"
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button onClick={() => onClick(depositAmount)} disabled={!memoDisabled || isDisabled}>
          {t('Earn.DRFPool.Stake', 'Stake')}
        </Button>
      </div>
    </Dialog>
  )
}

StakeDRFDialog.defaultProps = {}

export default StakeDRFDialog
