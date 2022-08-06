import React, { ChangeEvent, FC, useMemo, useState } from 'react'
import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'

import Trader from '@/class/Trader'
import { getEDRFAddress } from '@/utils/addressHelpers'
import { nonBigNumberInterception } from '@/utils/tools'
import { useTokenBalance } from '@/hooks/useTokenBalance'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const ExtendDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { balance } = useTokenBalance(getEDRFAddress())
  const { burnLimitPerDay } = Trader

  const [burnAmount, setBurnAmount] = useState<string>('')

  const memoDisabled = useMemo(() => {
    const _balance = new BN(balance)
    const _burnAmount = new BN(burnAmount)
    return (
      !burnAmount || _burnAmount.isLessThanOrEqualTo(0) || _balance.isEqualTo(0) || _balance.isLessThan(_burnAmount)
    )
  }, [balance, burnAmount])

  const memoAddDays = useMemo(() => {
    if (Number(burnAmount) <= 0) {
      return '0'
    } else {
      const _burnAmount = new BN(burnAmount)
      const _burnLimitPerDay = new BN(burnLimitPerDay)
      const div = _burnAmount.div(_burnLimitPerDay).toString()
      return nonBigNumberInterception(div, 0)
    }
  }, [burnAmount])

  const onChangeEv = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setBurnAmount(v)
  }

  const setMaxValueEv = () => {
    setBurnAmount(balance)
  }

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={t('Broker.Extend.ExtendBrokerPrivilege', 'Extend Broker Privilege')}
      onClose={onClose}
    >
      <div className="web-extend-dialog">
        <div className="web-extend-dialog-info">
          <div className="web-extend-dialog-wallet">
            <dl>
              <dt>{t('Broker.Extend.WalletBalance', 'Wallet Balance')}</dt>
              <dd>
                <BalanceShow value={balance} format={false} unit="eDRF" />
              </dd>
            </dl>
            <dl>
              <dt>{t('Broker.Extend.BrokerPrivilegePricePerDay', 'Broker privilege price per day')}</dt>
              <dd>
                <BalanceShow value={burnLimitPerDay} unit="eDRF" />
              </dd>
            </dl>
          </div>
          <div className="web-extend-dialog-amount">
            <p>
              <span>{t('Broker.Extend.AmountToBurn', 'Amount to burn')}</span>
              <em>
                +{memoAddDays} <u> {t('Broker.Extend.days', 'days')}</u>
              </em>
            </p>
            <label>
              <input type="number" value={burnAmount} onChange={onChangeEv} />
              <aside>
                <u>eDRF</u>
                <Button size="mini" onClick={setMaxValueEv}>
                  Max
                </Button>
              </aside>
            </label>
          </div>
        </div>
        <Button onClick={() => onClick(burnAmount)} disabled={memoDisabled}>
          {t('Broker.Extend.BurneDRF', 'Burn eDRF')}
        </Button>
      </div>
    </Dialog>
  )
}

ExtendDialog.defaultProps = {}

export default ExtendDialog
