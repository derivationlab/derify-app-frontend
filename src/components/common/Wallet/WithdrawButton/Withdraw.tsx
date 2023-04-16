import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo, useReducer } from 'react'

import { findToken } from '@/config/tokens'
import { reducer, stateInit } from '@/reducers/withdraw'
import { getTraderWithdrawAmount } from '@/api'
import { isET, isGT, isGTET, keepDecimals } from '@/utils/tools'
import { useMarginTokenStore, useTraderInfoStore } from '@/store'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
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

  const variables = useTraderInfoStore((state) => state.variables)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const variablesLoaded = useTraderInfoStore((state) => state.variablesLoaded)

  const memoMargin = useMemo(() => {
    if (variablesLoaded) {
      const { marginBalance, availableMargin } = variables
      const p1 = Number(marginBalance) - Number(availableMargin)
      const p2 = isET(marginBalance, 0) ? 0 : (p1 / Number(marginBalance)) * 100
      return [keepDecimals(p1, findToken(marginToken).decimals), keepDecimals(p2, 2)]
    }
    return [0, 0]
  }, [marginToken, variablesLoaded])

  const memoDisabled = useMemo(() => {
    if (variablesLoaded) {
      const { availableMargin } = variables
      return isGT(availableMargin, 0)
    }
    return true
  }, [variablesLoaded])

  const onChange = (v: string) => {
    if (isGTET(variables.availableMargin, v) && isGT(v, 0)) {
      dispatch({ type: 'SET_DISABLED', payload: false })
      dispatch({ type: 'SET_WITHDRAW_AMOUNT', payload: v })
    } else {
      dispatch({ type: 'SET_DISABLED', payload: true })
      dispatch({ type: 'SET_WITHDRAW_AMOUNT', payload: '0' })
    }
  }

  const funcAsync = async (account: string, amount: number) => {
    const { data } = await getTraderWithdrawAmount(account, amount, findToken(marginToken).tokenAddress)
    dispatch({ type: 'SET_WITHDRAW_DAT', payload: data })
  }

  useEffect(() => {
    if (address && Number(state.withdrawAmount) > 0) void funcAsync(address, Number(state.withdrawAmount))
  }, [address, state.withdrawAmount])

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
                <BalanceShow value={variables.availableMargin} unit={marginToken} />
              </dd>
            </dl>
            <address>
              {t('Trade.Withdraw.MarginUsage', 'Margin Usage')}: <em>{memoMargin[0]}</em> {marginToken}{' '}
              <em>( {memoMargin[1]}%)</em>
            </address>
          </div>
          <div className="amount">
            <AmountInput
              max={variables.availableMargin}
              unit={marginToken}
              title={t('Trade.Withdraw.AmountToWithdraw', 'Amount to withdraw')}
              onChange={onChange}
            />
            {state.withdrawData?.bMarginTokenAmount > 0 && (
              <p
                className="tips"
                dangerouslySetInnerHTML={{
                  __html: t('Trade.Withdraw.WithdrawTip', '', {
                    MarginToken: marginToken,
                    MarginAmount: keepDecimals(state.withdrawData?.marginTokenAmount, findToken(marginToken).decimals),
                    bMarginAmount: keepDecimals(
                      state.withdrawData?.bMarginTokenAmount,
                      findToken(marginToken).decimals
                    ),
                    bMarginToken: `b${marginToken}`
                  })
                }}
              />
            )}
          </div>
        </div>
        <Button onClick={() => onClick(state.withdrawAmount)} disabled={!memoDisabled || state.disabled}>
          {t('Trade.Withdraw.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

WithdrawDialog.defaultProps = {}

export default WithdrawDialog
