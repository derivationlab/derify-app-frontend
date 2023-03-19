import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'

import { useTraderInfo } from '@/zustand/useTraderInfo'
import { isGT, isGTET } from '@/utils/tools'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import AmountInput from '@/components/common/Wallet/AmountInput'
import { useMarginToken } from '@/zustand'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const ExchangebDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginToken((state) => state.marginToken)
  const rewardsInfo = useTraderInfo((state) => state.rewardsInfo)

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
              max={rewardsInfo?.exchangeable ?? 0}
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
