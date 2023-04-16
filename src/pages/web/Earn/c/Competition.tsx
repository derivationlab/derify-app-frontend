import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useContext, useEffect, useCallback } from 'react'

import { PubSubEvents } from '@/typings'
import { useRankReward } from '@/hooks/useDashboard'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenStore } from '@/store'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useWithdrawRankReward } from '@/hooks/useEarning'
import { bnMul, isET, isGT, isLT, keepDecimals } from '@/utils/tools'
import { findToken, PLATFORM_TOKEN } from '@/config/tokens'
import { useActiveRankGrantCount, useActiveRankGrantRatios, useActiveRankGrantTotalAmount } from '@/hooks/useQueryApi'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import QuestionPopover from '@/components/common/QuestionPopover'
import { Link } from 'react-router-dom'

const Competition: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const { withdraw } = useWithdrawRankReward()
  const { protocolConfig } = useProtocolConf(marginToken)
  const { data: grantRatio } = useActiveRankGrantRatios(findToken(marginToken).tokenAddress, address)
  const { data: grantAmount } = useActiveRankGrantTotalAmount(findToken(marginToken).tokenAddress)
  const { data: activeGrant } = useActiveRankGrantCount(findToken(marginToken).tokenAddress)
  const { data: rankReward, refetch, isLoading } = useRankReward(address, protocolConfig?.rewards)

  const withdrawFunc = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

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
  }, [signer])

  useEffect(() => {
    if (address && protocolConfig) void refetch()
  }, [address, protocolConfig])

  return (
    <div className="web-eran-item">
      <header className="web-eran-item-header">
        <h3>
          {t('Earn.Trading.TradingCompetition')}
          <QuestionPopover text={t('Earn.Trading.HigherTheRanking')} />
        </h3>
        <p>{t('Earn.Trading.JoinTrading')}</p>
      </header>
      <section className="web-eran-item-main">
        <div className="web-eran-item-dashboard">
          <DecimalShow value={keepDecimals(bnMul(grantRatio, 100), 2)} percent />
          <u>{t('Earn.Trading.RANK')}.</u>
        </div>
        <div className="web-eran-item-claim">
          <main>
            <h4>{t('Earn.PositionMining.Claimable')}</h4>
            <BalanceShow
              value={rankReward?.drfBalance ?? 0}
              unit={PLATFORM_TOKEN.symbol}
              decimal={
                isLoading ? 2 : isLT(rankReward?.drfBalance ?? 0, 1) && isGT(rankReward?.drfBalance ?? 0, 0) ? 8 : 2
              }
            />
            <div className="block" />
            <p>
              {t('Earn.PositionMining.TotalEarned')} :{' '}
              <strong>{keepDecimals(rankReward?.drfAccumulatedBalance ?? 0, PLATFORM_TOKEN.decimals)}</strong>{' '}
              {PLATFORM_TOKEN.symbol}
            </p>
          </main>
          <aside>
            <Button
              size={mobile ? 'mini' : 'default'}
              disabled={isET(rankReward?.drfBalance ?? 0, 0)}
              onClick={withdrawFunc}
            >
              {t('Earn.bDRFPool.ClaimAll', 'Claim All')}
            </Button>
            <Link to={`/${marginToken}/competition/rank`}>{t('Broker.BV.RankList')}</Link>
          </aside>
        </div>
        <div className="web-eran-item-card">
          <main>
            <h4>{t('Earn.Trading.RewardsPool')}</h4>
            <BalanceShow value={grantAmount.totalAmount} unit={PLATFORM_TOKEN.symbol} />
            <div className="block" />
            <p>
              {t('Earn.Trading.ActiveGrants')} : <strong>{activeGrant.count}</strong>
            </p>
          </main>
          <aside>
            <Button size={mobile ? 'mini' : 'default'} to={`/${marginToken}/trade`}>
              {t('Earn.Trading.Trade')}
            </Button>
          </aside>
        </div>
        <NotConnect />
      </section>
    </div>
  )
}

export default Competition
