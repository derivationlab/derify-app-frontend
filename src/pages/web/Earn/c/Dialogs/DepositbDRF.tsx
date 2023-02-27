import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'

import { isGT, isGTET } from '@/utils/tools'
import { useTokenBalances } from '@/zustand'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import AmountInput from '@/components/common/Wallet/AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const token = 'bBUSD'

const DepositbDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { data: ACCOUNT } = useAccount()

  const extraBalances = useTokenBalances((state) => state.extraBalances)

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('0')

  const memoDisabled = useMemo(() => {
    return isGT(extraBalances[token], 0)
  }, [extraBalances])

  const onChangeEv = (v: string) => {
    if (isGTET(extraBalances[token], v) && isGT(v, 0)) {
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
                <BalanceShow value={extraBalances[token]} unit={token} />
              </dd>
            </dl>
            <address>{ACCOUNT?.address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={extraBalances[token]}
              title={t('Earn.bDRFPool.AmountToDeposit', 'Amount to deposit')}
              unit={token}
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
