import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useState, useContext, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import DecimalShow from '@/components/common/DecimalShow'
import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import NotConnect from '@/components/web/NotConnect'
import tokens, { PLATFORM_TOKEN } from '@/config/tokens'
import { useCurrentIndex } from '@/hooks/useCurrentIndex'
import { useMiningOperation } from '@/hooks/useMiningOperation'
import { usePoolStaking } from '@/hooks/usePoolStaking'
import { useStakingDRF } from '@/hooks/useStakingDRF'
import { useTraderEDRFBalance } from '@/hooks/useTraderEDRFBalance'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { PubSubEvents } from '@/typings'
import { bnMul, isGT, isLT, keepDecimals } from '@/utils/tools'

import StakeDRFDialog from './Dialogs/StakeDRF'
import UnstakeDRFDialog from './Dialogs/UnstakeDRF'

const DerifyTokenPool: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const { redeemDrf, stakingDrf, withdrawAllEdrf } = useMiningOperation()
  const { data: drfBalance } = useStakingDRF()
  const { data: stakingInfo } = usePoolStaking(address)
  const { data: dashboardDAT } = useCurrentIndex(marginToken.address)
  const { data: edrfBalance, isLoading } = useTraderEDRFBalance(address)

  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const closeDialog = () => setVisibleStatus('')

  const stakeDrfFunc = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      closeDialog()

      const status = await stakingDrf(amount, signer)

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

      const status = await redeemDrf(amount, signer)
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

    const status = await withdrawAllEdrf(signer)
    if (status) {
      // succeed
      window.toast.success(t('common.success', 'success'))
    } else {
      // fail
      window.toast.error(t('common.failed', 'failed'))
    }

    window.toast.dismiss(toast)
  }, [signer])

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
              <Button size={mobile ? 'mini' : 'default'} disabled={!isGT(edrfBalance ?? 0, 0)} onClick={withdrawFunc}>
                {t('Earn.DerifyTokenPool.ClaimAll', 'Claim All')}
              </Button>
            </aside>
          </div>
          <div className="web-eran-item-card">
            <main>
              <h4>{t('Earn.DerifyTokenPool.Staked', 'Staked')}</h4>
              <BalanceShow value={stakingInfo?.drfBalance ?? 0} unit={PLATFORM_TOKEN.symbol} />
              <div className="block" />
              <p>
                {t('Earn.DerifyTokenPool.CurrentPoolSize', 'Current pool size')}{' '}
                <strong>{keepDecimals(drfBalance, tokens.drf.decimals)}</strong> {PLATFORM_TOKEN.symbol}
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
