import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'

import { isGT, isGTET } from '@/utils/tools'
import { useTraderInfoStore } from '@/store'

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
  const { address } = useAccount()

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('0')

  const stakingInfo = useTraderInfoStore((state) => state.stakingInfo)

  const memoDisabled = useMemo(() => {
    return isGT(stakingInfo?.drfBalance ?? 0, 0)
  }, [stakingInfo?.drfBalance])

  const onChangeEv = (v: string) => {
    if (isGTET(stakingInfo?.drfBalance ?? 0, v) && isGT(v, 0)) {
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
      title={t('Earn.DerifyTokenPool.UnstakeDRF', 'Unstake DRF')}
      onClose={onClose}
    >
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.DerifyTokenPool.StakingAmount', 'Staking Amount')}</dt>
              <dd>
                <BalanceShow value={stakingInfo?.drfBalance ?? 0} unit="DRF" />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={stakingInfo?.drfBalance ?? 0}
              title={t('Earn.DerifyTokenPool.AmountToUnstake', 'Amount to unstake')}
              unit="DRF"
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button onClick={() => onClick(depositAmount)} disabled={!memoDisabled || isDisabled}>
          {t('Earn.DerifyTokenPool.Unstake', 'Unstake')}
        </Button>
      </div>
    </Dialog>
  )
}

UnstakeDRFDialog.defaultProps = {}

export default UnstakeDRFDialog
