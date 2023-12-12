import { useAccount } from 'wagmi'

import React, { FC, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { reducer, stateInit } from '@/reducers/withdraw'
import { useMarginTokenStore, useBalancesStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { isGT, isGTET, nonBigNumberInterception } from '@/utils/tools'

import AmountInput from '../AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const DepositDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const [state, dispatch] = useReducer(reducer, stateInit)

  const balances = useBalancesStore((state) => state.balances)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const onChange = (v: string) => {
    if (isGTET(balances?.[marginToken.symbol] ?? 0, v) && isGT(v, 0)) {
      dispatch({ type: 'SET_MARGIN_DAT', payload: { disabled: false, amount: v } })
    } else {
      dispatch({ type: 'SET_MARGIN_DAT', payload: { disabled: true, amount: '0' } })
    }
  }

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={t('Trade.Deposit.DepositFromWallet', 'Deposit From Wallet')}
      onClose={onClose}
    >
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Trade.Deposit.WalletBalance', 'Wallet Balance')}</dt>
              <dd>
                <BalanceShow value={balances?.[marginToken.symbol] ?? 0} unit={marginToken.symbol} />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={nonBigNumberInterception(balances?.[marginToken.symbol] ?? 0, 18)}
              unit={marginToken.symbol}
              title={t('Trade.Deposit.AmountToDeposit', 'Amount to deposit')}
              onChange={onChange}
            />
          </div>
        </div>
        <Button
          onClick={() => onClick(state.marginDAT.amount)}
          disabled={!isGT(balances?.[marginToken.symbol] ?? 0, 0) || state.marginDAT.disabled}
        >
          {t('Trade.Deposit.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

DepositDialog.defaultProps = {}

export default DepositDialog
