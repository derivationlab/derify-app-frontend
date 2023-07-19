import { useAtomValue } from 'jotai'
import { useAccount } from 'wagmi'

import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { traderVariablesAtom } from '@/atoms/useTraderVariables'
import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { useAmountCanWithdrawn } from '@/hooks/useAmountCanWithdrawn'
import { useMarginTokenStore } from '@/store'
import { bnDiv, bnMinus, bnMul, isET, isLT, isLTET, keepDecimals } from '@/utils/tools'

import AmountInput from '../AmountInput'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const WithdrawDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const [amountInp, setAmountInp] = useState<string>('')
  const variables = useAtomValue(traderVariablesAtom)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const { canWithdrawn } = useAmountCanWithdrawn(address, amountInp, marginToken.address)

  const collateral = useMemo(() => {
    if (variables.loaded) {
      const { marginBalance, availableMargin } = variables.data
      const p1 = bnMinus(marginBalance, availableMargin)
      const p2 = isET(marginBalance, 0) ? 0 : bnMul(bnDiv(p1, marginBalance), 100)
      return [keepDecimals(p1, 2), keepDecimals(p2, 2)]
    }
    return [0, 0]
  }, [variables])

  const disabled = useMemo(() => {
    if (!variables.loaded) return true
    const { availableMargin } = variables.data
    return isLTET(availableMargin, 0) || isET(0, amountInp) || isLT(variables.data.availableMargin, amountInp)
  }, [variables, amountInp])

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
                <BalanceShow value={variables.data.availableMargin} unit={marginToken.symbol} />
              </dd>
            </dl>
            <address>
              {t('Trade.Withdraw.MarginUsage', 'Margin Usage')}: <em>{collateral[0]}</em> {marginToken.symbol}{' '}
              <em>( {collateral[1]}%)</em>
            </address>
          </div>
          <div className="amount">
            <AmountInput
              max={variables.data.availableMargin}
              unit={marginToken.symbol}
              title={t('Trade.Withdraw.AmountToWithdraw', 'Amount to withdraw')}
              onChange={setAmountInp}
            />
            {Number(canWithdrawn.bMarginTokenAmount) > 0 && (
              <p
                className="tips"
                dangerouslySetInnerHTML={{
                  __html: t('Trade.Withdraw.WithdrawTip', '', {
                    MarginToken: marginToken.symbol,
                    MarginAmount: keepDecimals(canWithdrawn.marginTokenAmount, 2),
                    bMarginAmount: keepDecimals(canWithdrawn.bMarginTokenAmount, 2),
                    bMarginToken: `b${marginToken.symbol}`
                  })
                }}
              />
            )}
          </div>
        </div>
        <Button onClick={() => onClick(amountInp)} disabled={disabled}>
          {t('Trade.Withdraw.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

export default WithdrawDialog
