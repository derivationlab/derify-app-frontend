import React, { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useTraderData } from '@/store/trader/hooks'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { getBUSDAddress } from '@/utils/addressHelpers'

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
  const { trader } = useTraderData()
  const { data: ACCOUNT } = useAccount()

  const [depositAmount, setDepositAmount] = useState<string>('0')
  const [isDisabled, setIsDisabled] = useState<boolean>(false)

  const memoDisabled = useMemo(() => {
    return new BN(trader?.exchangeable).isGreaterThan(0)
  }, [trader?.exchangeable])

  const onChangeEv = (v: string) => {
    const _v = new BN(v)
    const _balance = new BN(trader?.exchangeable)
    if (_balance.isGreaterThanOrEqualTo(v) && _v.isGreaterThan(0)) {
      setIsDisabled(false)
      setDepositAmount(v)
    } else {
      setIsDisabled(true)
      setDepositAmount('0')
    }
  }

  return (
    <Dialog width="540px" visible={visible} title={t('Earn.bDRFPool.ExchangeBDRF', 'Exchange bDRF')} onClose={onClose}>
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.bDRFPool.Exchangeable', 'Exchangeable')}</dt>
              <dd>
                <BalanceShow value={trader?.exchangeable ?? 0} unit={`bDRF→${BASE_TOKEN_SYMBOL}`} />
              </dd>
            </dl>
            <address>{ACCOUNT?.address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={trader?.exchangeable ?? 0}
              title={t('Earn.bDRFPool.AmountToExchange', 'Amount to exchange')}
              unit="bDRF"
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
