import { useAccount } from 'wagmi'

import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import AmountInput from '@/components/common/Wallet/AmountInput'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { usePoolEarning } from '@/hooks/usePoolEarning'
import { useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { isGT, isGTET, nonBigNumberInterception } from '@/utils/tools'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const WithdrawbDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('0')

  const { data: rewardsInfo } = usePoolEarning(address, protocolConfig?.rewards)

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

  const decimals = useMemo(() => {
    return Number(rewardsInfo?.bondReturnBalance ?? 0) === 0 ? 2 : marginToken.decimals
  }, [marginToken, rewardsInfo])

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={t('Earn.bDRFPool.WithdrawBDRF', { Token: `b${marginToken.symbol}` })}
      onClose={onClose}
    >
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.bDRFPool.Withdrawable', 'Withdrawable')}</dt>
              <dd>
                <BalanceShow
                  value={rewardsInfo?.bondReturnBalance ?? 0}
                  unit={`b${marginToken.symbol}`}
                  decimal={decimals}
                />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={nonBigNumberInterception(rewardsInfo?.bondReturnBalance ?? 0, 8)}
              title={t('Earn.bDRFPool.AmountToWithdraw', 'Amount to withdraw')}
              unit={`b${marginToken.symbol}`}
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
