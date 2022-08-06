import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'

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

const WithdrawbDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { data: ACCOUNT } = useAccount()
  const { trader } = useTraderData()

  const [depositAmount, setDepositAmount] = useState<string>('0')
  const [isDisabled, setIsDisabled] = useState<boolean>(false)

  const memoDisabled = useMemo(() => {
    return new BN(trader?.bondReturnBalance ?? 0).isGreaterThan(0)
  }, [trader?.bondReturnBalance])

  const onChangeEv = (v: string) => {
    const _v = new BN(v)
    const _balance = new BN(trader?.bondReturnBalance ?? 0)
    if (_balance.isGreaterThanOrEqualTo(v) && _v.isGreaterThan(0)) {
      setIsDisabled(false)
      setDepositAmount(v)
    } else {
      setIsDisabled(true)
      setDepositAmount('0')
    }
  }

  return (
    <Dialog width="540px" visible={visible} title={t('Earn.bDRFPool.WithdrawBDRF', 'Withdraw bDRF')} onClose={onClose}>
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.bDRFPool.Withdrawable', 'Withdrawable')}</dt>
              <dd>
                <BalanceShow value={trader?.bondReturnBalance ?? 0} unit="bDRF" />
              </dd>
            </dl>
            <address>{ACCOUNT?.address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={trader?.bondReturnBalance ?? 0}
              title={t('Earn.bDRFPool.AmountToWithdraw', 'Amount to withdraw')}
              unit="bDRF"
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button onClick={() => onClick(depositAmount)} disabled={!memoDisabled || isDisabled}>
          {t('Earn.bDRFPool.Withdraw', 'Withdraw')}
        </Button>
      </div>
    </Dialog>
  )
}

WithdrawbDRFDialog.defaultProps = {}

export default WithdrawbDRFDialog
