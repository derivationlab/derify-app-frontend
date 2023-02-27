import numeral from 'numeral'
import PubSub from 'pubsub-js'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useState, useContext } from 'react'

import { isGT } from '@/utils/tools'
import { PubSubEvents } from '@/typings'
import { usePoolsInfo } from '@/zustand/usePoolsInfo'
import { MobileContext } from '@/context/Mobile'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useProtocolConf1 } from '@/hooks/useMatchConf'
import { useMarginToken, useQuoteToken } from '@/zustand'
import { useDepositBondToBank, useExchangeBond, useRedeemBondFromBank, useWithdrawAllBond } from '@/hooks/useEarning'

import QuestionPopover from '@/components/common/QuestionPopover'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'

import DepositbDRFDialog from './Dialogs/DepositbDRF'
import WithdrawbDRFDialog from './Dialogs/WithdrawbDRF'
import ExchangebDRFDialog from './Dialogs/ExchangebDRF'

const EranbDRFPool: FC = () => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const rewardsInfo = useTraderInfo((state) => state.rewardsInfo)
  const marginToken = useMarginToken((state) => state.marginToken)
  const bondPoolBalance = usePoolsInfo((state) => state.bondPoolBalance)

  const { redeem } = useRedeemBondFromBank()
  const { deposit } = useDepositBondToBank()
  const { exchange } = useExchangeBond()
  const { withdraw } = useWithdrawAllBond()
  const { protocolConfig } = useProtocolConf1(quoteToken, marginToken)

  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const closeDialog = () => setVisibleStatus('')

  const depositFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    closeDialog()

    if (protocolConfig) {
      const status = await deposit(protocolConfig.rewards, protocolConfig.bMarginToken, amount)

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
  }

  const redeemFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    closeDialog()

    if (protocolConfig) {
      const status = await redeem(protocolConfig.rewards, amount)
      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const memoDisabled = useMemo(() => {
    return isGT(rewardsInfo?.bondBalance ?? 0, 0)
  }, [rewardsInfo])

  const memoAPY = useMemo(() => {
    return numeral((rewardsInfo?.bondAnnualInterestRatio ?? 0) * 100).format('0.00')
  }, [rewardsInfo])

  const exchangeFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    closeDialog()

    if (protocolConfig) {
      const status = await exchange(protocolConfig.rewards, protocolConfig.bMarginToken, amount)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const withdrawFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    closeDialog()

    if (protocolConfig) {
      const status = await withdraw(protocolConfig.rewards)
      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  return (
    <>
      <div className="web-eran-item">
        <header className="web-eran-item-header">
          <h3>
            {t('Earn.bDRFPool.bDRFPool', 'bBUSD Pool')}
            <QuestionPopover text={t('Earn.bDRFPool.bDRFPoolTip', 'bBUSD Pool', { APR: memoAPY })} />
          </h3>
          <p>
            {t(
              'Earn.bDRFPool.bDRFPoolTitle',
              'Deposit bBUSD to earn stable interests, or exchange bBUSD to stable coin.'
            )}
          </p>
        </header>
        <section className="web-eran-item-main">
          <div className="web-eran-item-dashboard">
            <DecimalShow value={(rewardsInfo?.bondAnnualInterestRatio ?? 0) * 100} percent />
            <u>APR.</u>
          </div>
          <div className="web-eran-item-claima">
            <main>
              <h4>{t('Earn.bDRFPool.Interests', 'Interests')}</h4>
              <BalanceShow value={rewardsInfo?.bondBalance ?? 0} unit="bBUSD" decimal={4} />
              <div className="block" />
              <p>
                {t('Earn.bDRFPool.Exchangeable', 'Exchangeable')} : <strong>{rewardsInfo?.exchangeable ?? 0}</strong>{' '}
                bBUSD
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
              <BalanceShow value={rewardsInfo?.bondReturnBalance ?? 0} unit="bBUSD" />
              <div className="block" />
              <p>
                {t('Earn.bDRFPool.TotalDeposited', 'Total deposited')} : <strong>{bondPoolBalance}</strong> bBUSD
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

export default EranbDRFPool
