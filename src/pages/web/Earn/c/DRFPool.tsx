import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useState, useContext } from 'react'

import tokens from '@/config/tokens'
import { PubSubEvents } from '@/typings'
import { usePoolsInfo } from '@/zustand/usePoolsInfo'
import { MobileContext } from '@/context/Mobile'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useDashboardDAT } from '@/zustand/useDashboardDAT'
import { useProtocolConf1 } from '@/hooks/useMatchConf'
import { isGT, keepDecimals } from '@/utils/tools'
import { useTraderEDRFBalance } from '@/hooks/useQueryApi'
import { useMarginToken, useQuoteToken } from '@/zustand'
import { useRedeemDrf, useStakingDrf, useWithdrawAllEdrf } from '@/hooks/useEarning'

import QuestionPopover from '@/components/common/QuestionPopover'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import StakeDRFDialog from './Dialogs/StakeDRF'
import UnstakeDRFDialog from './Dialogs/UnstakeDRF'

const DRFPool: FC = () => {
  const { t } = useTranslation()
  const { data } = useAccount()
  const { mobile } = useContext(MobileContext)

  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const stakingInfo = useTraderInfo((state) => state.stakingInfo)
  const dashboardDAT = useDashboardDAT((state) => state.dashboardDAT)
  const drfPoolBalance = usePoolsInfo((state) => state.drfPoolBalance)

  const { redeem } = useRedeemDrf()
  const { staking } = useStakingDrf()
  const { withdraw } = useWithdrawAllEdrf()
  const { protocolConfig } = useProtocolConf1(quoteToken, marginToken)
  const { data: edrfBalance } = useTraderEDRFBalance(data?.address)

  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const memoDisabled = useMemo(() => {
    return isGT(edrfBalance ?? 0, 0)
  }, [edrfBalance])

  const closeDialog = () => setVisibleStatus('')

  const stakeDrfFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    closeDialog()

    const status = await staking(amount)
    if (status) {
      // succeed
      window.toast.success(t('common.success', 'success'))

      PubSub.publish(PubSubEvents.UPDATE_BALANCE)
    } else {
      // fail
      window.toast.error(t('common.failed', 'failed'))
    }

    window.toast.dismiss(toast)
  }

  const redeemDrfFunc = async (amount: string) => {
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

  const withdrawFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

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
            {t('Earn.DRFPool.DRFPool', 'DRF Pool')}
            <QuestionPopover text={t('Earn.DRFPool.DRFPoolTip', 'Stake 1 DRF, mint 1 eDRF per day')} />
          </h3>
          <p>
            {t('Earn.DRFPool.DRFPoolTitle', 'Stake DRF to mint and use eDRF, the utilized token of Derify protocol.')}
          </p>
        </header>
        <section className="web-eran-item-main">
          <div className="web-eran-item-dashboard">
            <DecimalShow value={dashboardDAT?.drfStakingApy ?? 0} percent />
            <u>APR.</u>
          </div>
          <div className="web-eran-item-claima">
            <main>
              <h4>{t('Earn.DRFPool.Claimable', 'Claimable')}</h4>
              <BalanceShow value={edrfBalance ?? 0} unit="eDRF" decimal={tokens.edrf.decimals} />
            </main>
            <aside>
              <Button size={mobile ? 'mini' : 'default'} disabled={!memoDisabled} onClick={withdrawFunc}>
                {t('Earn.DRFPool.ClaimAll', 'Claim All')}
              </Button>
            </aside>
          </div>
          <div className="web-eran-item-card">
            <main>
              <h4>{t('Earn.DRFPool.Staked', 'Staked')}</h4>
              <BalanceShow value={stakingInfo?.drfBalance ?? 0} unit="DRF" />
              <div className="block" />
              <p>
                {t('Earn.DRFPool.CurrentPoolSize', 'Current pool size')} :{' '}
                <strong>{keepDecimals(drfPoolBalance, tokens.drf.decimals)}</strong> DRF
              </p>
            </main>
            <aside>
              <Button size={mobile ? 'mini' : 'default'} onClick={() => setVisibleStatus('stake')}>
                {t('Earn.DRFPool.Stake', 'Stake')}
              </Button>
              <Button size={mobile ? 'mini' : 'default'} onClick={() => setVisibleStatus('redeem')} outline>
                {t('Earn.DRFPool.Unstake', 'Unstake')}
              </Button>
            </aside>
          </div>
          <NotConnect />
        </section>
      </div>
      <StakeDRFDialog visible={visibleStatus === 'stake'} onClose={closeDialog} onClick={stakeDrfFunc} />
      <UnstakeDRFDialog visible={visibleStatus === 'redeem'} onClose={closeDialog} onClick={redeemDrfFunc} />
    </>
  )
}

export default DRFPool
