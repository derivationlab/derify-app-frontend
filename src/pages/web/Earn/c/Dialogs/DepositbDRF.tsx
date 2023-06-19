import { useAccount } from 'wagmi'

import React, { FC, useReducer, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import AmountInput from '@/components/common/Wallet/AmountInput'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { reducer, stateInit } from '@/reducers/staking'
import { getTokenBalance, useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { isGT, isGTET, nonBigNumberInterception } from '@/utils/tools'

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
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

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

  const decimals = useMemo(() => {
    return Number(state.depositDAT.balance) === 0 ? 2 : marginToken.decimals
  }, [marginToken, state.depositDAT.balance])

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={t('Earn.bDRFPool.DepositbDRF', { Token: `b${marginToken.symbol}` })}
      onClose={onClose}
    >
      <div className="web-deposit-dialog">
        <div className="web-deposit-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Earn.bDRFPool.WalletBalance', 'Wallet Balance')}</dt>
              <dd>
                <BalanceShow value={state.depositDAT.balance} unit={`b${marginToken.symbol}`} decimal={decimals} />
              </dd>
            </dl>
            <address>{address}</address>
          </div>
          <div className="amount">
            <AmountInput
              max={nonBigNumberInterception(state.depositDAT.balance, 8)}
              title={t('Earn.bDRFPool.AmountToDeposit', 'Amount to deposit')}
              unit={`b${marginToken.symbol}`}
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
