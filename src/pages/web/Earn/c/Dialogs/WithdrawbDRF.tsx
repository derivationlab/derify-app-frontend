import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'

import { useTraderInfo } from '@/zustand/useTraderInfo'
import { isGT, isGTET } from '@/utils/tools'
import { useMTokenFromRoute } from '@/hooks/useTrading'

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
  const { address } = useAccount()

  const marginToken = useMTokenFromRoute()
  const rewardsInfo = useTraderInfo((state) => state.rewardsInfo)

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('0')

  const memoDisabled = useMemo(() => {
    return isGT(rewardsInfo?.bondReturnBalance ?? 0, 0)
  }, [rewardsInfo?.bondReturnBalance])

  const onChangeEv = (v: string) => {
    if (isGTET(rewardsInfo?.bondReturnBalance ?? 0, v) && isGT(v, 0)) {
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
      title={t('Earn.bDRFPool.WithdrawBDRF', { Token: `b${marginToken}` })}
      onClose={onClose}
    >
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.bDRFPool.Withdrawable', 'Withdrawable')}</dt>
              <dd>
                <BalanceShow value={rewardsInfo?.bondReturnBalance ?? 0} unit={`b${marginToken}`} />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={rewardsInfo?.bondReturnBalance ?? 0}
              title={t('Earn.bDRFPool.AmountToWithdraw', 'Amount to withdraw')}
              unit={`b${marginToken}`}
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
