import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useReducer, useEffect } from 'react'

import { isGT, isGTET } from '@/utils/tools'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { reducer, stateInit } from '@/reducers/staking'
import { getTokenBalance, useMarginTokenStore } from '@/store'

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

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const { protocolConfig } = useProtocolConf(marginToken)

  const onChangeEv = (v: string) => {
    if (isGTET(state.depositDAT.balance, v) && isGT(v, 0)) {
      dispatch({ type: 'SET_DEPOSIT_DAT', payload: { disabled: false, inAmount: v } })
    } else {
      dispatch({ type: 'SET_DEPOSIT_DAT', payload: { disabled: true, inAmount: '0' } })
    }
  }

  useEffect(() => {
    const func = async (account: string, protocolConfig: string) => {
      const data = await getTokenBalance(account, protocolConfig)

      dispatch({ type: 'SET_DEPOSIT_DAT', payload: { balance: data } })
    }

    if (address && protocolConfig) void func(address, protocolConfig.bMarginToken)
  }, [address, protocolConfig])

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
                <BalanceShow value={state.depositDAT.balance} unit={`b${marginToken}`} />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={state.depositDAT.balance}
              title={t('Earn.bDRFPool.AmountToDeposit', 'Amount to deposit')}
              unit={`b${marginToken}`}
              onChange={onChangeEv}
            />
          </div>
        </div>
        <Button
          onClick={() => onClick(state.depositDAT.inAmount)}
          disabled={!isGT(state.depositDAT.balance, 0) || state.depositDAT.disabled}
        >
          {t('Earn.bDRFPool.Deposit', 'Deposit')}
        </Button>
      </div>
    </Dialog>
  )
}

DepositbDRFDialog.defaultProps = {}

export default DepositbDRFDialog
