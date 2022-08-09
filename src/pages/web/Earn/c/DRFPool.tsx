import React, { FC, useMemo, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useSigner } from 'wagmi'
import BN from 'bignumber.js'

import Earn from '@/class/Earn'
import { useAppDispatch } from '@/store'
import { useTraderData } from '@/store/trader/hooks'
import { getStakingInfoDataAsync } from '@/store/trader'
import { useConstantData } from '@/store/constant/hooks'
import { getStakingDrfPoolDataAsync } from '@/store/constant'
import { MobileContext } from '@/context/Mobile'

import QuestionPopover from '@/components/common/QuestionPopover'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import StakeDRFDialog from './Dialogs/StakeDRF'
import UnstakeDRFDialog from './Dialogs/UnstakeDRF'

const DRFPool: FC = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { trader } = useTraderData()
  const { stakingDrf, indicator } = useConstantData()
  const { mobile } = useContext(MobileContext)
  const { traderWithdrawEDRFRewards, traderStakingDrf, traderRedeemDrf } = Earn

  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const onCloseDialogEv = () => setVisibleStatus('')

  const stakeDrfFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer) {
      const account = await signer.getAddress()
      const status = await traderStakingDrf(signer, amount)
      if (status) {
        // succeed
        dispatch(getStakingDrfPoolDataAsync())
        dispatch(getStakingInfoDataAsync(account))

        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const redeemDrfFunc = async (amount: string) => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    onCloseDialogEv()

    if (signer) {
      const account = await signer.getAddress()
      const status = await traderRedeemDrf(signer, amount)
      if (status) {
        // succeed
        dispatch(getStakingDrfPoolDataAsync())
        dispatch(getStakingInfoDataAsync(account))

        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }

  const memoDisabled = useMemo(() => {
    if (trader?.stakingEDRFBalance) {
      const n = new BN(trader.stakingEDRFBalance)
      return n.isGreaterThan(0)
    }
  }, [trader?.stakingEDRFBalance])

  const withdrawEDRFRewardsFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (signer) {
      const status = await traderWithdrawEDRFRewards(signer)
      const account = await signer.getAddress()
      if (status) {
        // succeed
        dispatch(getStakingInfoDataAsync(account))
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
            <DecimalShow value={indicator?.drfStakingApy ?? 0} percent />
            <u>APY.</u>
          </div>
          <div className="web-eran-item-claima">
            <main>
              <h4>{t('Earn.DRFPool.Claimable', 'Claimable')}</h4>
              <BalanceShow value={trader?.stakingEDRFBalance ?? 0} unit="eDRF" />
            </main>
            <aside>
              <Button size={mobile ? 'mini' : 'default'} disabled={!memoDisabled} onClick={withdrawEDRFRewardsFunc}>
                {t('Earn.DRFPool.ClaimAll', 'Claim All')}
              </Button>
            </aside>
          </div>
          <div className="web-eran-item-card">
            <main>
              <h4>{t('Earn.DRFPool.Staked', 'Staked')}</h4>
              <BalanceShow value={trader?.stakingDRFBalance ?? 0} unit="DRF" />
              <div className="block" />
              <p>
                {t('Earn.DRFPool.CurrentPoolSize', 'Current pool size')} : <strong>{stakingDrf}</strong> DRF
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
      <StakeDRFDialog visible={visibleStatus === 'stake'} onClose={onCloseDialogEv} onClick={stakeDrfFunc} />
      <UnstakeDRFDialog visible={visibleStatus === 'redeem'} onClose={onCloseDialogEv} onClick={redeemDrfFunc} />
    </>
  )
}

export default DRFPool
