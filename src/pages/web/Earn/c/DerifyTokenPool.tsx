import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useState, useContext, useEffect } from 'react'

import { PubSubEvents } from '@/typings'
import { usePoolsInfo } from '@/zustand/usePoolsInfo'
import { MobileContext } from '@/providers/Mobile'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useProtocolConf } from '@/hooks/useMatchConf'
import tokens, { findToken } from '@/config/tokens'

import { bnMul, isGT, keepDecimals } from '@/utils/tools'
import { useCurrentIndexDAT, useTraderEDRFBalance } from '@/hooks/useQueryApi'
import { useRedeemDrf, useStakingDrf, useWithdrawAllEdrf } from '@/hooks/useEarning'

import QuestionPopover from '@/components/common/QuestionPopover'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import StakeDRFDialog from './Dialogs/StakeDRF'
import UnstakeDRFDialog from './Dialogs/UnstakeDRF'
import { useMarginToken } from '@/zustand'

const DerifyTokenPool: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { mobile } = useContext(MobileContext)

  const stakingInfo = useTraderInfo((state) => state.stakingInfo)
  const drfPoolBalance = usePoolsInfo((state) => state.drfPoolBalance)

  const marginToken = useMarginToken((state) => state.marginToken)
  const { redeem } = useRedeemDrf()
  const { staking } = useStakingDrf()
  const { withdraw } = useWithdrawAllEdrf()
  const { protocolConfig } = useProtocolConf(marginToken)
  const { data: edrfBalance } = useTraderEDRFBalance(address)
  const { data: dashboardDAT, refetch: dashboardDATRefetch } = useCurrentIndexDAT(findToken(marginToken).tokenAddress)

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

  useEffect(() => {
    void dashboardDATRefetch()
  }, [marginToken])

  return (
    <>
      <div className="web-eran-item">
        <header className="web-eran-item-header">
          <h3>
            {t('Earn.DerifyTokenPool.DerifyTokenPool', 'DRF Pool')}
            <QuestionPopover text={t('Earn.DerifyTokenPool.DRFPoolTip', 'Stake 1 DRF, mint 1 eDRF per day')} />
          </h3>
          <p>
            {t(
              'Earn.DerifyTokenPool.DRFPoolTitle',
              'Stake DRF to mint and use eDRF, the utilized token of Derify protocol.'
            )}
          </p>
        </header>
        <section className="web-eran-item-main">
          <div className="web-eran-item-dashboard">
            <DecimalShow value={keepDecimals(bnMul(dashboardDAT?.drfStakingApy ?? 0, 100), 2)} percent />
            <u>APR.</u>
          </div>
          <div className="web-eran-item-claim">
            <main>
              <h4>{t('Earn.DerifyTokenPool.Claimable', 'Claimable')}</h4>
              <BalanceShow value={edrfBalance ?? 0} unit="eDRF" />
            </main>
            <aside>
              <Button size={mobile ? 'mini' : 'default'} disabled={!memoDisabled} onClick={withdrawFunc}>
                {t('Earn.DerifyTokenPool.ClaimAll', 'Claim All')}
              </Button>
            </aside>
          </div>
          <div className="web-eran-item-card">
            <main>
              <h4>{t('Earn.DerifyTokenPool.Staked', 'Staked')}</h4>
              <BalanceShow value={stakingInfo?.drfBalance ?? 0} unit="DRF" />
              <div className="block" />
              <p>
                {t('Earn.DerifyTokenPool.CurrentPoolSize', 'Current pool size')} :{' '}
                <strong>{keepDecimals(drfPoolBalance, tokens.drf.decimals)}</strong> DRF
              </p>
            </main>
            <aside>
              <Button size={mobile ? 'mini' : 'default'} onClick={() => setVisibleStatus('stake')}>
                {t('Earn.DerifyTokenPool.Stake', 'Stake')}
              </Button>
              <Button size={mobile ? 'mini' : 'default'} onClick={() => setVisibleStatus('redeem')} outline>
                {t('Earn.DerifyTokenPool.Unstake', 'Unstake')}
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

export default DerifyTokenPool
