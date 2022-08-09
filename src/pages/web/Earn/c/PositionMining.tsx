import { useSigner } from 'wagmi'
import BN from 'bignumber.js'
import React, { FC, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Earn from '@/class/Earn'
import { useAppDispatch } from '@/store'
import { MobileContext } from '@/context/Mobile'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useTraderData } from '@/store/trader/hooks'
import { nonBigNumberInterception } from '@/utils/tools'
import { useConstantData } from '@/store/constant/hooks'
import { useContractData } from '@/store/contract/hooks'
import { getPMRewardDataAsync, getStakingInfoDataAsync } from '@/store/actions'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import QuestionPopover from '@/components/common/QuestionPopover'

const PositionMining: FC = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { trader } = useTraderData()
  const { mobile } = useContext(MobileContext)
  const { positions } = useConstantData()
  const { pairs, pairsLoaded } = useContractData()
  const { traderWithdrawPMRewards } = Earn

  const memoPositionApy = useMemo(() => {
    if (pairsLoaded) {
      const apy = pairs.map((d) => d.apy)
      const max = String(Math.max.apply(null, apy) * 100)
      return nonBigNumberInterception(max)
    }
  }, [pairsLoaded, pairs])

  const memoPositionsAm = useMemo(() => {
    if (positions[0]) {
      const { long_position_amount, short_position_amount } = positions[0]
      if (long_position_amount && short_position_amount) {
        const m = new BN(long_position_amount)
        const n = new BN(short_position_amount)
        const s = m.plus(n).toString()
        return nonBigNumberInterception(s)
      }
    }
    return '0'
  }, [positions])

  const memoDisabled = useMemo(() => {
    const m = new BN(trader?.drfBalance ?? 0)
    const n = new BN(trader?.usdBalance ?? 0)
    return n.isGreaterThan(0) || m.isGreaterThan(0)
  }, [trader?.usdBalance, trader?.drfBalance])

  const withdrawPMRewardsFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (signer) {
      // + trader?.drfBalance? todo
      const amount = new BN(trader?.usdBalance ?? 0).plus(new BN(trader?.drfBalance ?? 0)).toString()
      // const amount = trader?.usdBalance ?? 0
      const status = await traderWithdrawPMRewards(signer)
      const account = await signer.getAddress()
      if (status) {
        // succeed
        dispatch(getPMRewardDataAsync(account))
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
    <div className="web-eran-item">
      <header className="web-eran-item-header">
        <h3>
          {t('Earn.PositionMining.PositionMining', 'Position Mining')}
          <QuestionPopover
            text={t('Earn.PositionMining.PositionMiningTip', 'More position, more profit from position mining')}
          />
        </h3>
        <p>{t('Earn.PositionMining.OpenPositionTitle', 'Open position to earn position mining rewards.')}</p>
      </header>
      <section className="web-eran-item-main">
        <div className="web-eran-item-dashboard">
          <DecimalShow value={Number(memoPositionApy)} percent suffix="(max)" />
          <u>APY.</u>
        </div>
        <div className="web-eran-item-claima">
          <main>
            <h4>{t('Earn.PositionMining.Claimable', 'Claimable')}</h4>
            <BalanceShow value={trader?.usdBalance ?? 0} unit={BASE_TOKEN_SYMBOL} />
            <BalanceShow value={trader?.drfBalance ?? 0} unit="DRF" />
            <p>
              {t('Earn.PositionMining.TotalEarned', 'Total earned :')}{' '}
              <strong>{trader?.usdAccumulatedBalance ?? 0}</strong> {BASE_TOKEN_SYMBOL}{' '}
              {t('Earn.PositionMining.And', 'and')} <strong>{trader?.drfAccumulatedBalance ?? 0}</strong> DRF
            </p>
          </main>
          <aside>
            <Button size={mobile ? 'mini' : 'default'} disabled={!memoDisabled} onClick={withdrawPMRewardsFunc}>
              {t('Earn.PositionMining.ClaimAll', 'Claim All')}
            </Button>
          </aside>
        </div>
        <div className="web-eran-item-card">
          <main>
            <h4>{t('Earn.PositionMining.Positions', 'Positions')}</h4>
            <BalanceShow value={trader?.totalPositionAmount ?? 0} unit={BASE_TOKEN_SYMBOL} />
            <div className="block" />
            <p>
              {t('Earn.PositionMining.TotalPositions', 'Total positions')} : <strong>{memoPositionsAm}</strong>{' '}
              {BASE_TOKEN_SYMBOL}
            </p>
          </main>
          <aside>
            <Button size={mobile ? 'mini' : 'default'} to="/trade">
              {t('Earn.PositionMining.OpenPosition', 'Open Position')}
            </Button>
          </aside>
        </div>
        <NotConnect />
      </section>
    </div>
  )
}

export default PositionMining
