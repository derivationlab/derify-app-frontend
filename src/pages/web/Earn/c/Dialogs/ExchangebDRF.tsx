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

const ExchangebDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [depositAmount, setDepositAmount] = useState<string>('0')

  const { data: rewardsInfo } = usePoolEarning(address, protocolConfig?.rewards)

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

  const decimals = useMemo(() => {
    return Number(rewardsInfo?.exchangeable ?? 0) === 0 ? 2 : marginToken.decimals
  }, [marginToken, rewardsInfo])

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={t('Earn.bDRFPool.ExchangeBDRF', { Token: `b${marginToken.symbol}` })}
      onClose={onClose}
    >
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.bDRFPool.Exchangeable', 'Exchangeable')}</dt>
              <dd>
                <BalanceShow
                  value={rewardsInfo?.exchangeable ?? 0}
                  unit={`b${marginToken.symbol}→${marginToken.symbol}`}
                  decimal={decimals}
                />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={nonBigNumberInterception(rewardsInfo?.exchangeable ?? 0, 8)}
              title={t('Earn.bDRFPool.AmountToExchange', 'Amount to exchange')}
              unit={`b${marginToken.symbol}`}
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
