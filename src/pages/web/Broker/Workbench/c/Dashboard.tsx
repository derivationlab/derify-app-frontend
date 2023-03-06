import BN from 'bignumber.js'
import dayjs from 'dayjs'
import PubSub from 'pubsub-js'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useContext, useMemo } from 'react'

import { PubSubEvents } from '@/typings'
import { MobileContext } from '@/context/Mobile'
import { useBrokerInfo } from '@/zustand/useBrokerInfo'
import { useDashboardDAT } from '@/zustand/useDashboardDAT'
import { useWithdrawReward } from '@/hooks/useBroker'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { nonBigNumberInterception } from '@/utils/tools'

import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { useSigner } from 'wagmi'

const Dashboard: FC = () => {
  const { t } = useTranslation()
  const { data: signer } = useSigner()

  const { mobile } = useContext(MobileContext)
  const { withdraw } = useWithdrawReward()

  const marginToken = useMTokenFromRoute()

  const brokerInfo = useBrokerInfo((state) => state.brokerInfo)
  const brokerAssets = useBrokerInfo((state) => state.brokerAssets)
  const dashboardDAT = useDashboardDAT((state) => state.dashboardDAT)

  const withdrawFunc = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (signer) {
      const status = await withdraw(signer)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_BROKER_DAT)
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }
    }

    window.toast.dismiss(toast)
  }, [signer])

  const memoTotalBalance = useMemo(() => {
    const drf = String(brokerAssets?.drfRewardBalance ?? 0)
    const usd = String(brokerAssets?.usdRewardBalance ?? 0)
    return [nonBigNumberInterception(usd), nonBigNumberInterception(drf)]
  }, [brokerAssets])

  const memoHistoryBalance = useMemo(() => {
    const drf = String(brokerAssets?.accumulatedDrfReward ?? 0)
    const usd = String(brokerAssets?.accumulatedUsdReward ?? 0)
    return [nonBigNumberInterception(usd), nonBigNumberInterception(drf)]
  }, [brokerAssets])

  const memoTodayRewards = useMemo(() => {
    const drf_reward = new BN(brokerAssets?.drf_reward ?? 0).times(dashboardDAT?.drfPrice ?? 0)
    const rewards_plus = drf_reward.plus(brokerAssets?.usd_reward ?? 0).toString()
    return nonBigNumberInterception(rewards_plus)
  }, [brokerAssets, dashboardDAT])

  const memoDisabled = useMemo(() => {
    const [usd, drf] = memoTotalBalance
    return Number(usd) > 0 || Number(drf) > 0
  }, [memoTotalBalance])

  return (
    <div className="web-broker-dashboard">
      <div className="web-broker-dashboard-balance">
        <section>
          <h3>{t('Broker.BV.BrokerAccountBalance', 'Broker Account Balance')}</h3>
          <BalanceShow value={memoTotalBalance[0]} unit={marginToken} />
          <BalanceShow value={memoTotalBalance[1]} unit="DRF" />
          <p
            dangerouslySetInnerHTML={{
              __html: t('Broker.BV.EarnedTip', '', {
                Amount: memoHistoryBalance[0],
                Margin: marginToken,
                DRF: memoHistoryBalance[1],
                time: brokerInfo?.registerTime ? dayjs(brokerInfo?.registerTime).format('MMM DD, YYYY') : '--'
              })
            }}
          />
        </section>
        <Button size={mobile ? 'mini' : 'default'} onClick={withdrawFunc} disabled={!memoDisabled}>
          {t('Broker.BV.ClaimAll', 'Claim All')}
        </Button>
      </div>
      <div className="web-broker-dashboard-data">
        {mobile ? (
          <>
            <main>
              <header>{t('Broker.BV.DailyRewards', 'Daily Rewards')}</header>
              <section>
                <BalanceShow value={memoTodayRewards} unit={marginToken} />
              </section>
              <footer>
                <Link to={`/${marginToken}/broker-rank`}>
                  {t('Broker.BV.BrokerRank', 'Broker Rank')} #{brokerInfo?.rank}
                </Link>
              </footer>
            </main>
            <hr />
            <main>
              <header>{t('Broker.BV.DailyActiveTrader', 'Daily Active Trader')}</header>
              <section>{brokerInfo?.traders_num ?? 0}</section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.Transactions', '', {
                    data: brokerInfo?.txs_num ?? 0
                  })
                }}
              />
            </main>
          </>
        ) : (
          <>
            <main>
              <header>{t('Broker.BV.DailyRewards', 'Daily Rewards')}</header>
              <section>
                <BalanceShow value={memoTodayRewards} unit={marginToken} />
              </section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.TotalRewards', '', {
                    data: `${((brokerInfo.usd_reward_rate ?? 0) * 100).toFixed(2)}%`
                  })
                }}
              />
            </main>
            <main>
              <header>{t('Broker.BV.DailyActiveTrader', 'Daily Active Trader')}</header>
              <section>{brokerInfo?.traders_num ?? 0}</section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.Transactions', '', {
                    data: brokerInfo?.txs_num ?? 0
                  })
                }}
              />
            </main>
            <main>
              <header>{t('Broker.BV.BrokerRank', 'Broker Rank')}</header>
              <section>#{brokerInfo?.rank}</section>
              <footer>
                <Link to={`/${marginToken}/broker-rank`}>{t('Broker.BV.RankList', 'Rank List')}</Link>
              </footer>
            </main>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
