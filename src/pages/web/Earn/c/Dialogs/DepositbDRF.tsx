import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'

import { useTokenBalance } from '@/hooks/useTokenBalance'
import { getbBUSDAddress } from '@/utils/addressHelpers'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import AmountInput from '@/components/common/Wallet/AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const DepositbDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { data: ACCOUNT } = useAccount()
  const { balance } = useTokenBalance(getbBUSDAddress())

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
    <Dialog width="540px" visible={visible} title={t('Earn.bDRFPool.DepositbDRF', 'Deposit bBUSD')} onClose={onClose}>
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.bDRFPool.WalletBalance', 'Wallet Balance')}</dt>
              <dd>
                <BalanceShow value={balance} unit="bBUSD" />
              </dd>
            </dl>
            <address>{ACCOUNT?.address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={balance}
              title={t('Earn.bDRFPool.AmountToDeposit', 'Amount to deposit')}
              unit="bBUSD"
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button onClick={() => onClick(depositAmount)} disabled={!memoDisabled || isDisabled}>
          {t('Earn.bDRFPool.Deposit', 'Deposit')}
        </Button>
      </div>
    </Dialog>
  )
}

DepositbDRFDialog.defaultProps = {}

export default DepositbDRFDialog
