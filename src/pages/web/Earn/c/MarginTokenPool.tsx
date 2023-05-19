import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useMemo, useState, useContext, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import DecimalShow from '@/components/common/DecimalShow'
import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import NotConnect from '@/components/web/NotConnect'
import { findToken } from '@/config/tokens'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useTraderBondBalance } from '@/hooks/useQueryApi'
import { useDepositBondToBank, useExchangeBond, useRedeemBondFromBank, useWithdrawAllBond } from '@/hooks/useTrading'
import { MobileContext } from '@/providers/Mobile'
import { useTraderInfoStore, usePoolsInfoStore, useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { PubSubEvents } from '@/typings'
import { isGT, isLT, keepDecimals } from '@/utils/tools'

import DepositbDRFDialog from './Dialogs/DepositbDRF'
import ExchangebDRFDialog from './Dialogs/ExchangebDRF'
import WithdrawbDRFDialog from './Dialogs/WithdrawbDRF'

const MarginTokenPool: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { mobile } = useContext(MobileContext)

  const rewardsInfo = useTraderInfoStore((state) => state.rewardsInfo)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const bondPoolBalance = usePoolsInfoStore((state) => state.bondPoolBalance)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

  const { redeem } = useRedeemBondFromBank()
  const { deposit } = useDepositBondToBank()
  const { exchange } = useExchangeBond()
  const { withdraw } = useWithdrawAllBond()
  const { data: bondBalance, isLoading } = useTraderBondBalance(address, marginToken.address)

  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const closeDialog = () => setVisibleStatus('')

  const depositFunc = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      closeDialog()

      if (protocolConfig) {
        const status = await deposit(protocolConfig.rewards, protocolConfig.bMarginToken, amount, signer)

        if (status) {
          // succeed
          window.toast.success(t('common.success', 'success'))

          PubSub.publish(PubSubEvents.UPDATE_BALANCE)
        } else {
          // fail
          window.toast.error(t('common.failed', 'failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [signer, protocolConfig]
  )

  const redeemFunc = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      closeDialog()

      if (protocolConfig) {
        const status = await redeem(protocolConfig.rewards, amount, signer)
        if (status) {
          // succeed
          window.toast.success(t('common.success', 'success'))

          PubSub.publish(PubSubEvents.UPDATE_BALANCE)
        } else {
          // fail
          window.toast.error(t('common.failed', 'failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [signer, protocolConfig]
  )

  const memoDisabled = useMemo(() => {
    return isGT(bondBalance ?? 0, 0)
  }, [bondBalance])

  const memoAPY = useMemo(() => {
    return keepDecimals((rewardsInfo?.bondAnnualInterestRatio ?? 0) * 100, 2)
  }, [rewardsInfo])

  const exchangeFunc = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      closeDialog()

      if (protocolConfig) {
        const status = await exchange(protocolConfig.rewards, protocolConfig.bMarginToken, amount, signer)

        if (status) {
          // succeed
          window.toast.success(t('common.success', 'success'))
        } else {
          // fail
          window.toast.error(t('common.failed', 'failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [signer, protocolConfig]
  )

  const withdrawFunc = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    closeDialog()

    if (protocolConfig) {
      const status = await withdraw(protocolConfig.rewards, signer)
      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_BALANCE)
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }, [signer, protocolConfig])

  return (
    <>
      <div className="web-eran-item">
        <header className="web-eran-item-header">
          <h3>
            {t('Earn.bDRFPool.bDRFPool', { Token: `b${marginToken.symbol}` })}
            <QuestionPopover text={t('Earn.bDRFPool.bDRFPoolTip', { APR: memoAPY, Token: `b${marginToken.symbol}` })} />
          </h3>
          <p>{t('Earn.bDRFPool.bDRFPoolTitle', { Token: `b${marginToken.symbol}`, Margin: marginToken.symbol })}</p>
        </header>
        <section className="web-eran-item-main">
          <div className="web-eran-item-dashboard">
            <DecimalShow value={memoAPY} percent />
            <u>APR.</u>
          </div>
          <div className="web-eran-item-claim">
            <main>
              <h4>{t('Earn.bDRFPool.Interests', 'Interests')}</h4>
              <BalanceShow
                value={bondBalance ?? 0}
                unit={`b${marginToken.symbol}`}
                decimal={isLoading ? 2 : isLT(bondBalance ?? 0, 1) && isGT(bondBalance ?? 0, 0) ? 8 : 2}
              />
              <div className="block" />
              <p>
                {t('Earn.bDRFPool.Exchangeable', 'Exchangeable')} :{' '}
                <strong>{keepDecimals(rewardsInfo?.exchangeable ?? 0, 2)}</strong> {`b${marginToken.symbol}`}
              </p>
            </main>
            <aside>
              <Button size={mobile ? 'mini' : 'default'} disabled={!memoDisabled} onClick={withdrawFunc}>
                {t('Earn.bDRFPool.ClaimAll', 'Claim All')}
              </Button>
              <Button size={mobile ? 'mini' : 'default'} onClick={() => setVisibleStatus('exchange')} outline>
                {t('Earn.bDRFPool.Exchange', 'Exchange')}
              </Button>
            </aside>
          </div>
          <div className="web-eran-item-card">
            <main>
              <h4>{t('Earn.bDRFPool.Deposited', 'Deposited')}</h4>
              <BalanceShow value={rewardsInfo?.bondReturnBalance ?? 0} unit={`b${marginToken.symbol}`} />
              <div className="block" />
              <p>
                {t('Earn.bDRFPool.TotalDeposited', 'Total deposited')} :{' '}
                <strong>{keepDecimals(bondPoolBalance, 2)}</strong> {`b${marginToken.symbol}`}
              </p>
            </main>
            <aside>
              <Button size={mobile ? 'mini' : 'default'} onClick={() => setVisibleStatus('deposit')}>
                {t('Earn.bDRFPool.Deposit', 'Deposit')}
              </Button>
              <Button size={mobile ? 'mini' : 'default'} onClick={() => setVisibleStatus('withdraw')} outline>
                {t('Earn.bDRFPool.Withdraw', 'Withdraw')}
              </Button>
            </aside>
          </div>
          <NotConnect />
        </section>
      </div>
      <DepositbDRFDialog visible={visibleStatus === 'deposit'} onClose={closeDialog} onClick={depositFunc} />
      <WithdrawbDRFDialog visible={visibleStatus === 'withdraw'} onClose={closeDialog} onClick={redeemFunc} />
      <ExchangebDRFDialog visible={visibleStatus === 'exchange'} onClose={closeDialog} onClick={exchangeFunc} />
    </>
  )
}

export default MarginTokenPool
