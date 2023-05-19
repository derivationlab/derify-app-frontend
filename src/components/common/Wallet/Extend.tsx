import React, { ChangeEvent, FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { useBrokerExtend } from '@/hooks/useBrokerExtend'
import { useBalancesStore } from '@/store'
import { bnDiv, isET, isLT, isLTET } from '@/utils/tools'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const ExtendDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { brokerExtend } = useBrokerExtend()

  const balances = useBalancesStore((state) => state.balances)

  const [burnAmount, setBurnAmount] = useState<string>('')

  const memoDisabled = useMemo(() => {
    return isLTET(burnAmount, 0) || isET(balances?.['edrf'] ?? 0, 0) || isLT(balances?.['edrf'] ?? 0, burnAmount)
  }, [balances, burnAmount])

  const memoAddDays = useMemo(() => {
    if (Number(burnAmount) <= 0 || brokerExtend.burnLimitPerDay === 0) {
      return '0'
    } else {
      const div = bnDiv(burnAmount, brokerExtend.burnLimitPerDay)
      return Math.floor(div as any)
    }
  }, [burnAmount, brokerExtend])

  const onChangeEv = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setBurnAmount(v)
  }

  const setMaxValueEv = () => {
    setBurnAmount(balances?.['edrf'] ?? 0)
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
                <BalanceShow value={balances?.['edrf'] ?? 0} unit="eDRF" />
              </dd>
            </dl>
            <dl>
              <dt>{t('Broker.Extend.BrokerPrivilegePricePerDay', 'Broker privilege price per day')}</dt>
              <dd>
                <BalanceShow value={brokerExtend.burnLimitPerDay} unit="eDRF" />
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
