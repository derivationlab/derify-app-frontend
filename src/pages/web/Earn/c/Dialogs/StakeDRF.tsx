import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'

import { useTokenBalances } from '@/store'
import { isGT, isGTET } from '@/utils/tools'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import AmountInput from '@/components/common/Wallet/AmountInput'
import { PLATFORM_TOKEN } from '@/config/tokens'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const StakeDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const balances = useTokenBalances((state) => state.balances)

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('0')

  const memoDisabled = useMemo(() => {
    return isGT(balances['drf'], 0)
  }, [balances])

  const onChangeEv = (v: string) => {
    if (isGTET(balances['drf'], v) && isGT(v, 0)) {
      setIsDisabled(false)
      setDepositAmount(v)
    } else {
      setIsDisabled(true)
      setDepositAmount('0')
    }
  }

  return (
    <Dialog width="540px" visible={visible} title={t('Earn.DerifyTokenPool.StakeDRF', 'Stake DRF')} onClose={onClose}>
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.DerifyTokenPool.WalletBalance', 'Wallet Balance')}</dt>
              <dd>
                <BalanceShow value={balances[PLATFORM_TOKEN.symbol]} unit={PLATFORM_TOKEN.symbol} />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={balances[PLATFORM_TOKEN.symbol]}
              title={t('Earn.DerifyTokenPool.AmountToStake', 'Amount to stake')}
              unit={PLATFORM_TOKEN.symbol}
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button onClick={() => onClick(depositAmount)} disabled={!memoDisabled || isDisabled}>
          {t('Earn.DerifyTokenPool.Stake', 'Stake')}
        </Button>
      </div>
    </Dialog>
  )
}

StakeDRFDialog.defaultProps = {}

export default StakeDRFDialog
