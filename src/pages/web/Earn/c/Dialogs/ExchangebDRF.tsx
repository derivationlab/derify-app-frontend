import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'

import { isGT, isGTET, nonBigNumberInterception } from '@/utils/tools'
import { useTraderInfoStore, useMarginTokenStore } from '@/store'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import AmountInput from '@/components/common/Wallet/AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const ExchangebDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const rewardsInfo = useTraderInfoStore((state) => state.rewardsInfo)

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('0')

  const memoDisabled = useMemo(() => {
    return isGT(rewardsInfo?.exchangeable ?? 0, 0)
  }, [rewardsInfo?.exchangeable])

  const onChangeEv = (v: string) => {
    if (isGTET(rewardsInfo?.exchangeable ?? 0, v) && isGT(v, 0)) {
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
      title={t('Earn.bDRFPool.ExchangeBDRF', { Token: `b${marginToken}` })}
      onClose={onClose}
    >
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.bDRFPool.Exchangeable', 'Exchangeable')}</dt>
              <dd>
                <BalanceShow value={rewardsInfo?.exchangeable ?? 0} unit={`b${marginToken}→${marginToken}`} />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={nonBigNumberInterception(rewardsInfo?.exchangeable ?? 0, 2)}
              title={t('Earn.bDRFPool.AmountToExchange', 'Amount to exchange')}
              unit={`b${marginToken}`}
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button onClick={() => onClick(depositAmount)} disabled={!memoDisabled || isDisabled}>
          {t('Earn.bDRFPool.Exchange', 'Exchange')}
        </Button>
      </div>
    </Dialog>
  )
}

ExchangebDRFDialog.defaultProps = {}

export default ExchangebDRFDialog
