import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useReducer } from 'react'

import { isGT, isGTET } from '@/utils/tools'
import { reducer, stateInit } from '@/reducers/withdraw'
import { useMarginToken, useTokenBalances } from '@/zustand'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

import AmountInput from '../AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const DepositDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { data } = useAccount()

  const [state, dispatch] = useReducer(reducer, stateInit)

  const balances = useTokenBalances((state) => state.balances)
  const marginToken = useMarginToken((state) => state.marginToken)

  const memoDisabled = useMemo(() => {
    return isGT(balances[marginToken], 0)
  }, [balances])

  const onChange = (v: string) => {
    if (isGTET(balances[marginToken], v) && isGT(v, 0)) {
      dispatch({ type: 'SET_DISABLED', payload: false })
      dispatch({ type: 'SET_WITHDRAW_AMOUNT', payload: v })
    } else {
      dispatch({ type: 'SET_DISABLED', payload: true })
      dispatch({ type: 'SET_WITHDRAW_AMOUNT', payload: '0' })
    }
  }

  return (
    <Dialog
      width='540px'
      visible={visible}
      title={t('Trade.Deposit.DepositFromWallet', 'Deposit From Wallet')}
      onClose={onClose}
    >
      <div className='web-deposit-dialog'>
        <div className='web-deposit-dialog-info'>
          <div className='wallet'>
            <dl>
              <dt>{t('Trade.Deposit.WalletBalance', 'Wallet Balance')}</dt>
              <dd>
                <BalanceShow value={balances[marginToken]} unit={marginToken} />
              </dd>
            </dl>
            <address>{data?.address}</address>
          </div>
          <div className='amount'>
            <AmountInput
              max={balances[marginToken]}
              unit={marginToken}
              title={t('Trade.Deposit.AmountToDeposit', 'Amount to deposit')}
              onChange={onChange}
            />
          </div>
        </div>
        <Button onClick={() => onClick(state.depositAmount)} disabled={!memoDisabled || state.disabled}>
          {t('Trade.Deposit.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

DepositDialog.defaultProps = {}

export default DepositDialog
