import { useAccount } from 'wagmi'

import React, { FC, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import { getTraderWithdrawAmount } from '@/api'
import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { reducer, stateInit } from '@/reducers/withdraw'
import { useMarginTokenStore, useTraderInfoStore, useTraderVariablesStore } from '@/store'
import { bnDiv, bnMinus, bnMul, isET, isGT, isGTET, keepDecimals } from '@/utils/tools'

import AmountInput from '../AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const WithdrawDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const [state, dispatch] = useReducer(reducer, stateInit)

  const variables = useTraderVariablesStore((state) => state.variables)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const variablesLoaded = useTraderInfoStore((state) => state.variablesLoaded)

  const memoMargin = useMemo(() => {
    if (variablesLoaded) {
      const { marginBalance, availableMargin } = variables
      const p1 = bnMinus(marginBalance, availableMargin)
      const p2 = isET(marginBalance, 0) ? 0 : bnMul(bnDiv(p1, marginBalance), 100)
      return [keepDecimals(p1, 2), keepDecimals(p2, 2)]
    }
    return [0, 0]
  }, [variablesLoaded])

  const memoDisabled = useMemo(() => {
    if (variablesLoaded) {
      const { availableMargin } = variables
      return isGT(availableMargin, 0)
    }
    return true
  }, [variablesLoaded])

  const onChange = (v: string) => {
    if (isGTET(variables.availableMargin, v) && isGT(v, 0)) {
      dispatch({ type: 'SET_MARGIN_DAT', payload: { disabled: false, amount: v } })
    } else {
      dispatch({ type: 'SET_MARGIN_DAT', payload: { disabled: true, amount: '0' } })
    }
  }

  const funcAsync = async (account: string, amount: number) => {
    const { data } = await getTraderWithdrawAmount(account, amount, marginToken.address)

    dispatch({ type: 'SET_NECESSARY', payload: data })
  }

  useEffect(() => {
    if (address && Number(state.marginDAT.amount) > 0) void funcAsync(address, Number(state.marginDAT.amount))
  }, [address, state.marginDAT])

  return (
    <Dialog
      width="540px"
      visible={visible}
      title={t('Trade.Withdraw.WithdrawToWallet', 'Withdraw to wallet')}
      onClose={onClose}
    >
      <div className="web-withdraw-dialog">
        <div className="web-deposit-dialog-info web-withdraw-dialog-info">
          <div className="wallet">
            <dl>
              <dt>{t('Trade.Withdraw.Withdrawable', 'Withdrawable')}</dt>
              <dd>
                <BalanceShow value={variables.availableMargin} unit={marginToken.symbol} />
              </dd>
            </dl>
            <address>
              {t('Trade.Withdraw.MarginUsage', 'Margin Usage')}: <em>{memoMargin[0]}</em> {marginToken.symbol}{' '}
              <em>( {memoMargin[1]}%)</em>
            </address>
          </div>
          <div className="amount">
            <AmountInput
              max={variables.availableMargin}
              unit={marginToken.symbol}
              title={t('Trade.Withdraw.AmountToWithdraw', 'Amount to withdraw')}
              onChange={onChange}
            />
            {state.necessary?.bMarginTokenAmount > 0 && (
              <p
                className="tips"
                dangerouslySetInnerHTML={{
                  __html: t('Trade.Withdraw.WithdrawTip', '', {
                    MarginToken: marginToken.symbol,
                    MarginAmount: keepDecimals(state.necessary?.marginTokenAmount, 2),
                    bMarginAmount: keepDecimals(state.necessary?.bMarginTokenAmount, 2),
                    bMarginToken: `b${marginToken.symbol}`
                  })
                }}
              />
            )}
          </div>
        </div>
        <Button onClick={() => onClick(state.marginDAT.amount)} disabled={!memoDisabled || state.marginDAT.disabled}>
          {t('Trade.Withdraw.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default WithdrawDialog
