import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useReducer, useEffect } from 'react'

import { isGT, isGTET } from '@/utils/tools'
import { getTokenBalance, useMarginToken } from '@/zustand'
import { useProtocolConf } from '@/hooks/useMatchConf'

import { reducer, stateInit } from '@/reducers/earn'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import AmountInput from '@/components/common/Wallet/AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const DepositbDRFDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginToken((state) => state.marginToken)
  const { protocolConfig } = useProtocolConf(marginToken)

  const memoDisabled = useMemo(() => {
    return isGT(state.balance, 0)
  }, [state.balance])

  const onChangeEv = (v: string) => {
    if (isGTET(state.balance, v) && isGT(v, 0)) {
      dispatch({ type: 'SET_DISABLED', payload: false })
      dispatch({ type: 'SET_IN_AMOUNT', payload: v })
    } else {
      dispatch({ type: 'SET_DISABLED', payload: true })
      dispatch({ type: 'SET_IN_AMOUNT', payload: '0' })
    }
  }

  useEffect(() => {
    const func = async (account: string, protocolConfig: string) => {
      const data = await getTokenBalance(account, protocolConfig)

      dispatch({ type: 'SET_BALANCE', payload: data })
    }

    if (address && protocolConfig) void func(address, protocolConfig.bMarginToken)
  }, [])

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={t('Earn.bDRFPool.DepositbDRF', { Token: `b${marginToken}` })}
      onClose={onClose}
    >
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.bDRFPool.WalletBalance', 'Wallet Balance')}</dt>
              <dd>
                <BalanceShow value={state.balance} unit={`b${marginToken}`} />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={state.balance}
              title={t('Earn.bDRFPool.AmountToDeposit', 'Amount to deposit')}
              unit={`b${marginToken}`}
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button onClick={() => onClick(state.inAmount)} disabled={!memoDisabled || state.disabled}>
          {t('Earn.bDRFPool.Deposit', 'Deposit')}
        </Button>
      </div>
    </Dialog>
  )
}

DepositbDRFDialog.defaultProps = {}

export default DepositbDRFDialog
