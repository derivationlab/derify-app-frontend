import BN from 'bignumber.js'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useState } from 'react'

import { findToken } from '@/config/tokens'
import { useTokenBalance } from '@/hooks/useTokenBalance'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

import AmountInput from '../AmountInput'
import { useContractConfig } from '@/store/config/hooks'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const DepositDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { data: ACCOUNT } = useAccount()
  const { marginToken } = useContractConfig()

  // todo balances redux?
  const { balance } = useTokenBalance(findToken(marginToken).tokenAddress)

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('0')

  const memoDisabled = useMemo(() => {
    return new BN(balance).isGreaterThan(0)
  }, [balance])
  console.info(memoDisabled)
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
    <Dialog
      width="540px"
      visible={visible}
      title={t('Trade.Deposit.DepositFromWallet', 'Deposit From Wallet')}
      onClose={onClose}
    >
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Trade.Deposit.WalletBalance', 'Wallet Balance')}</dt>
              <dd>
                <BalanceShow value={balance} unit={marginToken} />
              </dd>
            </dl>
            <address>{ACCOUNT?.address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={balance}
              unit={marginToken}
              title={t('Trade.Deposit.AmountToDeposit', 'Amount to deposit')}
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button onClick={() => onClick(depositAmount)} disabled={!memoDisabled || isDisabled}>
          {t('Trade.Deposit.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

DepositDialog.defaultProps = {}

export default DepositDialog
