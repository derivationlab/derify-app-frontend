import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useState, useContext, useEffect, useCallback } from 'react'

import { PubSubEvents } from '@/typings'
import { MobileContext } from '@/providers/Mobile'
import tokens, { findToken } from '@/config/tokens'
import { bnMul, isGT, isLT, keepDecimals } from '@/utils/tools'
import { useCurrentIndexDAT, useTraderEDRFBalance } from '@/hooks/useQueryApi'
import { useRedeemDrf, useStakingDrf, useWithdrawAllEdrf } from '@/hooks/useTrading'
import { useTraderInfoStore, usePoolsInfoStore, useMarginTokenStore } from '@/store'

import QuestionPopover from '@/components/common/QuestionPopover'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import StakeDRFDialog from './Dialogs/StakeDRF'
import UnstakeDRFDialog from './Dialogs/UnstakeDRF'

const DerifyTokenPool: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()

  const { mobile } = useContext(MobileContext)

  const stakingInfo = useTraderInfoStore((state) => state.stakingInfo)
  const drfPoolBalance = usePoolsInfoStore((state) => state.drfPoolBalance)
  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const { redeem } = useRedeemDrf()
  const { staking } = useStakingDrf()
  const { withdraw } = useWithdrawAllEdrf()
  const { data: edrfBalance, isLoading } = useTraderEDRFBalance(address)
  const { data: dashboardDAT, refetch: dashboardDATRefetch } = useCurrentIndexDAT(findToken(marginToken).tokenAddress)

  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const memoDisabled = useMemo(() => {
    return isGT(edrfBalance ?? 0, 0)
  }, [edrfBalance])

  const closeDialog = () => setVisibleStatus('')

  const stakeDrfFunc = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      closeDialog()

      const status = await staking(amount, signer)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_BALANCE)
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }

      window.toast.dismiss(toast)
    },
    [signer]
  )

  const redeemDrfFunc = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      closeDialog()

      const status = await redeem(amount, signer)
      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }

      window.toast.dismiss(toast)
    },
    [signer]
  )

  const withdrawFunc = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    const status = await withdraw(signer)
    if (status) {
      // succeed
      window.toast.success(t('common.success', 'success'))
    } else {
      // fail
      window.toast.error(t('common.failed', 'failed'))
    }

    window.toast.dismiss(toast)
  }, [signer])

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
              <BalanceShow
                value={edrfBalance ?? 0}
                unit="eDRF"
                decimal={isLoading ? 2 : isLT(edrfBalance ?? 0, 1) && isGT(edrfBalance ?? 0, 0) ? 8 : 2}
              />
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
