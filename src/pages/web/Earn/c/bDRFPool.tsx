import React, { FC, useMemo, useState, useContext } from 'react'
import numeral from 'numeral'
import BN from 'bignumber.js'
import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'

import Earn from '@/class/Earn'
import { useAppDispatch } from '@/store'
import { MobileContext } from '@/context/Mobile'
import { useTraderData } from '@/store/trader/hooks'
import { getBondInfoDataAsync } from '@/store/trader'
import { useConstantData } from '@/store/constant/hooks'
import { getBankBDRFPoolDataAsync } from '@/store/constant'

import QuestionPopover from '@/components/common/QuestionPopover'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'

import DepositbDRFDialog from './Dialogs/DepositbDRF'
import WithdrawbDRFDialog from './Dialogs/WithdrawbDRF'
import ExchangebDRFDialog from './Dialogs/ExchangebDRF'

const EranbDRFPool: FC = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { trader } = useTraderData()
  const { bBUSDPool } = useConstantData()
  const { mobile } = useContext(MobileContext)

  const { traderWithdrawBond, traderPledgedBond, traderRedemptionBond, traderExchangeBond } = Earn

  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const onCloseDialogEv = () => setVisibleStatus('')

  const pledgedBondFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer) {
      const account = await signer.getAddress()
      const status = await traderPledgedBond(signer, amount)
      if (status) {
        // succeed
        dispatch(getBankBDRFPoolDataAsync())
        dispatch(getBondInfoDataAsync(account))

        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const redeemBondFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer) {
      const account = await signer.getAddress()
      const status = await traderRedemptionBond(signer, amount)
      if (status) {
        // succeed
        dispatch(getBankBDRFPoolDataAsync())
        dispatch(getBondInfoDataAsync(account))

        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const memoDisabled = useMemo(() => {
    if (trader?.bondBalance) {
      const n = new BN(trader.bondBalance)
      return n.isGreaterThan(0)
    }
  }, [trader?.bondBalance])

  // todo
  const memoAPY = useMemo(() => {
    return numeral((trader?.bondAnnualInterestRatio ?? 0) * 100).format('0.00')
  }, [trader?.bondAnnualInterestRatio])

  const exchangeBondFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer) {
      const status = await traderExchangeBond(signer, amount)
      const account = await signer.getAddress()
      if (status) {
        // succeed
        dispatch(getBondInfoDataAsync(account))
        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const withdrawBondFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer) {
      const status = await traderWithdrawBond(signer)
      const account = await signer.getAddress()
      if (status) {
        // succeed
        dispatch(getBondInfoDataAsync(account))
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
            <DecimalShow value={(trader?.bondAnnualInterestRatio ?? 0) * 100} percent />
            <u>APY.</u>
          </div>
          <div className="web-eran-item-claima">
            <main>
              <h4>{t('Earn.bDRFPool.Interests', 'Interests')}</h4>
              <BalanceShow value={trader?.bondBalance ?? 0} unit="bBUSD" decimal={4} />
              <div className="block" />
              <p>
                {t('Earn.bDRFPool.Exchangeable', 'Exchangeable')} : <strong>{trader?.exchangeable ?? 0}</strong> bBUSD
              </p>
            </main>
            <aside>
              <Button size={mobile ? 'mini' : 'default'} disabled={!memoDisabled} onClick={withdrawBondFunc}>
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
              <BalanceShow value={trader?.bondReturnBalance ?? 0} unit="bBUSD" />
              <div className="block" />
              <p>
                {t('Earn.bDRFPool.TotalDeposited', 'Total deposited')} : <strong>{bBUSDPool}</strong> bBUSD
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
      <DepositbDRFDialog visible={visibleStatus === 'deposit'} onClose={onCloseDialogEv} onClick={pledgedBondFunc} />
      <WithdrawbDRFDialog visible={visibleStatus === 'withdraw'} onClose={onCloseDialogEv} onClick={redeemBondFunc} />
      <ExchangebDRFDialog visible={visibleStatus === 'exchange'} onClose={onCloseDialogEv} onClick={exchangeBondFunc} />
    </>
  )
}

export default EranbDRFPool
