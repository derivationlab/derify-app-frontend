import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo, useReducer } from 'react'

import { useTraderInfo } from '@/store/useTraderInfo'
import { useMarginToken } from '@/store'
import { reducer, stateInit } from '@/reducers/withdraw'
import { getTraderWithdrawAmount } from '@/api'
import { isET, isGT, isGTET, nonBigNumberInterception } from '@/utils/tools'

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

  const variables = useTraderInfo((state) => state.variables)
  const variablesLoaded = useTraderInfo((state) => state.variablesLoaded)
  const marginToken = useMarginToken((state) => state.marginToken)

  const memoMargin = useMemo(() => {
    if (variablesLoaded) {
      const { marginBalance, availableMargin } = variables
      const p1 = Number(marginBalance) - Number(availableMargin)
      const p2 = isET(marginBalance, 0) ? 0 : (p1 / Number(marginBalance)) * 100
      return [nonBigNumberInterception(p1), p2]
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
      dispatch({ type: 'SET_DISABLED', payload: false })
      dispatch({ type: 'SET_WITHDRAW_AMOUNT', payload: v })
    } else {
      dispatch({ type: 'SET_DISABLED', payload: true })
      dispatch({ type: 'SET_WITHDRAW_AMOUNT', payload: '0' })
    }
  }

  const funcAsync = async (account: string, amount: number) => {
    const { data } = await getTraderWithdrawAmount(account, amount)
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
            {state.withdrawData?.bdrfAmount > 0 && (
              <p
                className="tips"
                dangerouslySetInnerHTML={{
                  __html: t('Trade.Withdraw.WithdrawTip', '', {
                    BUSD: nonBigNumberInterception(state.withdrawData?.usdAmount, 8),
                    bBUSD: nonBigNumberInterception(state.withdrawData?.bdrfAmount, 8)
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
