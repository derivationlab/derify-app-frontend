import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { getDUSDAddress } from '@/utils/addressHelpers'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

import AmountInput from '../AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const DepositDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { data: ACCOUNT } = useAccount()
  const { balance } = useTokenBalance(getDUSDAddress())

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('0')

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
                <BalanceShow value={balance} unit={BASE_TOKEN_SYMBOL} />
              </dd>
            </dl>
            <address>{ACCOUNT?.address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={balance}
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
