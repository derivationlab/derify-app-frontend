import dayjs from 'dayjs'
import BN from 'bignumber.js'
import { useSigner } from 'wagmi'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useContext, useMemo } from 'react'

import Broker from '@/class/Broker'
import { useAppDispatch } from '@/store'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useTraderData } from '@/store/trader/hooks'
import { getBrokerDataAsync } from '@/store/trader'
import { useConstantData } from '@/store/constant/hooks'
import { MobileContext } from '@/context/Mobile'
import { nonBigNumberInterception } from '@/utils/tools'

import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

const Dashboard: FC = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { broker } = useTraderData()
  const { indicator } = useConstantData()
  const { data: signer } = useSigner()
  const { mobile } = useContext(MobileContext)
  const { withdrawBrokerReward } = Broker

  const withdrawRewardsCb = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (signer) {
      const status = await withdrawBrokerReward(signer)
      const account = await signer.getAddress()

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        dispatch(getBrokerDataAsync(account))
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }

      window.toast.dismiss(toast)
    }
  }, [signer])

  const memoTotalBalance = useMemo(() => {
    const drf = String(broker?.drfRewardBalance ?? 0)
    const usd = String(broker?.usdRewardBalance ?? 0)
    return [nonBigNumberInterception(usd), nonBigNumberInterception(drf)]
  }, [broker?.usdRewardBalance, broker?.drfRewardBalance])

  const memoHistoryBalance = useMemo(() => {
    const drf = String(broker?.accumulatedDrfReward ?? 0)
    const usd = String(broker?.accumulatedUsdReward ?? 0)
    return [nonBigNumberInterception(usd), nonBigNumberInterception(drf)]
  }, [broker?.accumulatedDrfReward, broker?.accumulatedUsdReward])

  const memoTodayRewards = useMemo(() => {
    const drf_reward = new BN(broker?.drf_reward ?? 0).times(indicator?.drfPrice ?? 0)
    const rewards_plus = drf_reward.plus(broker?.usd_reward ?? 0).toString()
    return nonBigNumberInterception(rewards_plus)
  }, [broker?.usd_reward, broker?.drf_reward])

  const memoDisabled = useMemo(() => {
    const [usd, drf] = memoTotalBalance
    return Number(usd) > 0 || Number(drf) > 0
  }, [memoTotalBalance])
  // console.info(broker)
  return (
    <div className="web-broker-dashboard">
      <div className="web-broker-dashboard-balance">
        <section>
          <h3>{t('Broker.BV.BrokerAccountBalance', 'Broker Account Balance')}</h3>
          <BalanceShow value={memoTotalBalance[0]} unit={BASE_TOKEN_SYMBOL} />
          <BalanceShow value={memoTotalBalance[1]} unit="DRF" />
          <p
            dangerouslySetInnerHTML={{
              __html: t('Broker.BV.EarnedTip', '', {
                [BASE_TOKEN_SYMBOL]: memoHistoryBalance[0],
                DRF: memoHistoryBalance[1],
                time: broker?.update_time ? dayjs(broker?.update_time).format('MMM DD, YYYY') : '--'
              })
            }}
          />
        </section>
        <Button size={mobile ? 'mini' : 'default'} onClick={withdrawRewardsCb} disabled={!memoDisabled}>
          {t('Broker.BV.ClaimAll', 'Claim All')}
        </Button>
      </div>
      <div className="web-broker-dashboard-data">
        {mobile ? (
          <>
            <main>
              <header>{t('Broker.BV.DailyRewards', 'Daily Rewards')}</header>
              <section>
                <BalanceShow value={memoTodayRewards} unit={BASE_TOKEN_SYMBOL} />
              </section>
              <footer>
                <Link to="/broker-rank">{t('Broker.BV.BrokerRank', 'Broker Rank')} #{broker?.rank}</Link>
              </footer>
            </main>
            <hr />
            <main>
              <header>{t('Broker.BV.DailyActiveTrader', 'Daily Active Trader')}</header>
              <section>{broker?.traders_num ?? 0}</section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.Transactions', '', {
                    data: broker?.txs_num ?? 0
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
                <BalanceShow value={memoTodayRewards} unit={BASE_TOKEN_SYMBOL} />
              </section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.TotalRewards', '', {
                    data: `${(broker.usd_reward_rate * 100).toFixed(2)}%`
                  })
                }}
              />
            </main>
            <main>
              <header>{t('Broker.BV.DailyActiveTrader', 'Daily Active Trader')}</header>
              <section>{broker?.traders_num ?? 0}</section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.Transactions', '', {
                    data: broker?.txs_num ?? 0
                  })
                }}
              />
            </main>
            <main>
              <header>{t('Broker.BV.BrokerRank', 'Broker Rank')}</header>
              <section>#{broker?.rank}</section>
              <footer>
                <Link to="/broker-rank">{t('Broker.BV.RankList', 'Rank List')}</Link>
              </footer>
            </main>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
