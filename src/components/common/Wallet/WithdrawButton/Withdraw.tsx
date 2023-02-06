import BN from 'bignumber.js'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useMemo, useState } from 'react'

import { useTraderData } from '@/store/trader/hooks'
import { nonBigNumberInterception, safeInterceptionValues } from '@/utils/tools'

import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import AmountInput from '../AmountInput'
import { getTraderWithdrawAmount } from '@/api'
import { useAccount } from 'wagmi'
import { useContractConfig } from '@/store/config/hooks'

interface Props {
  visible: boolean
  onClose: () => void
  onClick: (amount: string) => void
}

const WithdrawDialog: FC<Props> = ({ visible, onClose, onClick }) => {
  const { t } = useTranslation()
  const { data } = useAccount()
  const { trader } = useTraderData()
  const { marginToken } = useContractConfig()

  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [withdrawInfo, setWithdrawInfo] = useState<Record<string, any>>({})
  const [withdrawAmount, setWithdrawAmount] = useState<string>('0')

  const memoMargin = useMemo(() => {
    if (!isEmpty(trader)) {
      const { marginBalance, availableMargin } = trader
      const _marginBalance = new BN(marginBalance)
      const minus = _marginBalance.minus(availableMargin)
      const n1 = minus.toString()
      const n2 = n1.includes('.') ? safeInterceptionValues(n1) : n1
      const n3 = _marginBalance.isEqualTo(0) ? 0 : minus.div(marginBalance).times(100).toFixed(2)
      return [n2, n3]
    }
    return [0, 0]
  }, [trader.marginBalance, trader.availableMargin])

  const memoDisabled = useMemo(() => {
    if (!isEmpty(trader)) {
      const { availableMargin } = trader
      return new BN(availableMargin).isGreaterThan(0)
    }
    return true
  }, [trader.availableMargin])

  const onChangeEv = (v: string) => {
    const _v = new BN(v)
    const _availableMargin = new BN(trader.availableMargin)
    if (_availableMargin.isGreaterThanOrEqualTo(v) && _v.isGreaterThan(0)) {
      setIsDisabled(false)
      setWithdrawAmount(v)
    } else {
      setIsDisabled(true)
      setWithdrawAmount('0')
    }
  }

  const getTraderWithdrawAmountFunc = async (account: string, amount: string) => {
    const { data } = await getTraderWithdrawAmount(account, amount)
    setWithdrawInfo(data)
  }

  useEffect(() => {
    if (data?.address && Number(withdrawAmount) > 0)
      void getTraderWithdrawAmountFunc(data.address, withdrawAmount)
  }, [data?.address, withdrawAmount])

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
                <BalanceShow value={trader.availableMargin} unit={marginToken} />
              </dd>
            </dl>
            <address>
              {t('Trade.Withdraw.MarginUsage', 'Margin Usage')}: <em>{memoMargin[0]}</em> {marginToken}{' '}
              <em>( {memoMargin[1]}%)</em>
            </address>
          </div>
          <div className="amount">
            <AmountInput
              max={trader.availableMargin}
              unit={marginToken}
              title={t('Trade.Withdraw.AmountToWithdraw', 'Amount to withdraw')}
              onChange={onChangeEv}
            />
            {withdrawInfo?.bdrfAmount > 0 && (
              <p
                className="tips"
                dangerouslySetInnerHTML={{
                  __html: t('Trade.Withdraw.WithdrawTip', '', {
                    BUSD: nonBigNumberInterception(withdrawInfo?.usdAmount, 8),
                    bBUSD: nonBigNumberInterception(withdrawInfo?.bdrfAmount, 8)
                  })
                }}
              />
            )}
          </div>
        </div>
        <Button onClick={() => onClick(withdrawAmount)} disabled={!memoDisabled || isDisabled}>
          {t('Trade.Withdraw.Confirm', 'Confirm')}
        </Button>
      </div>
    </Dialog>
  )
}

WithdrawDialog.defaultProps = {}

export default WithdrawDialog
