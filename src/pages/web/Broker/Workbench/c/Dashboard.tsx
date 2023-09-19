import dayjs from 'dayjs'
import { useAtomValue, useSetAtom } from 'jotai'
import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import {
  asyncBrokerRankingAtom,
  asyncBrokerSignUpTimeAtom,
  brokerRankingAtom,
  brokerSignUpTimeAtom
} from '@/atoms/useBrokerData'
import Button from '@/components/common/Button'
import { Link } from '@/components/common/Route'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { useBrokerAssets } from '@/hooks/useBrokerAssets'
import { useBrokerOperation } from '@/hooks/useBrokerOperation'
import { useBrokerRewardsToday } from '@/hooks/useBrokerRewardsToday'
import { useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { PubSubEvents } from '@/typings'
import { keepDecimals, numeralNumber } from '@/utils/tools'

const format = (d: string | null) => (d ? dayjs(d).format('MMM DD, YYYY') : '--')

const Dashboard: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const brokerRanking = useAtomValue(brokerRankingAtom)
  const brokerSignUpTime = useAtomValue(brokerSignUpTimeAtom)
  const asyncBrokerRanking = useSetAtom(
    asyncBrokerRankingAtom({
      userAccount: address,
      marginToken: marginToken.address
    })
  )
  const asyncBrokerSignUpTime = useSetAtom(asyncBrokerSignUpTimeAtom(address))
  const { withdrawBrokerReward } = useBrokerOperation()
  const { brokerRewardsToday } = useBrokerRewardsToday(address, marginToken.address)
  const { brokerAssets } = useBrokerAssets(address, protocolConfig?.rewards)

  const withdraw = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending'))
    const status = await withdrawBrokerReward(signer, protocolConfig?.rewards)
    if (status) {
      // succeed
      window.toast.success(t('common.success'))
      PubSub.publish(PubSubEvents.UPDATE_BALANCE)
    } else {
      window.toast.error(t('common.failed'))
      // failed
    }
    window.toast.dismiss(toast)
  }, [signer, protocolConfig])

  const assetsLatest = useMemo(
    () => [brokerAssets.drfRewardBalance, brokerAssets.marginTokenRewardBalance],
    [brokerAssets]
  )

  const assetsHistory = useMemo(
    () => [brokerAssets.accumulatedDrfReward, brokerAssets.accumulatedMarginTokenReward],
    [brokerAssets]
  )

  const disabled = useMemo(() => {
    const [drfRewardBalance, marginTokenRewardBalance] = assetsLatest
    return (Number(drfRewardBalance) === 0 && Number(marginTokenRewardBalance) === 0) || !signer || !protocolConfig
  }, [signer, protocolConfig, assetsLatest])

  useEffect(() => {
    if (address) void asyncBrokerSignUpTime()
  }, [address])

  useEffect(() => {
    if (address && marginToken) void asyncBrokerRanking()
  }, [address, marginToken])

  return (
    <div className="web-broker-dashboard">
      <div className="web-broker-dashboard-balance">
        <section>
          <h3>{t('Broker.BV.BrokerAccountBalance')}</h3>
          <BalanceShow
            value={keepDecimals(assetsLatest[1], marginToken.decimals)}
            unit={marginToken.symbol}
            decimal={Number(assetsLatest[1]) === 0 ? 2 : marginToken.decimals}
          />
          <BalanceShow
            value={keepDecimals(assetsLatest[0], PLATFORM_TOKEN.decimals)}
            unit={PLATFORM_TOKEN.symbol}
            decimal={Number(assetsLatest[0]) === 0 ? 2 : PLATFORM_TOKEN.decimals}
          />
          <p
            dangerouslySetInnerHTML={{
              __html: t('Broker.BV.EarnedTip', '', {
                Amount1: numeralNumber(assetsHistory[1], marginToken.decimals),
                Margin: marginToken.symbol,
                Amount2: keepDecimals(assetsHistory[0], PLATFORM_TOKEN.decimals),
                Time: format(brokerSignUpTime)
              })
            }}
          />
        </section>
        <Button size={isMobile ? 'mini' : 'default'} onClick={withdraw} disabled={disabled}>
          {t('Broker.BV.ClaimAll', 'Claim All')}
        </Button>
      </div>
      <div className="web-broker-dashboard-data">
        {isMobile ? (
          <>
            <main>
              <header>{t('Broker.BV.DailyRewards', 'Daily Rewards')}</header>
              <section>
                <BalanceShow
                  value={brokerRewardsToday.margin_token_reward}
                  unit={marginToken.symbol}
                  decimal={Number(brokerRewardsToday.margin_token_reward) === 0 ? 2 : marginToken.decimals}
                />
                <BalanceShow value={brokerRewardsToday.drf_reward} unit={PLATFORM_TOKEN.symbol} />
              </section>
              <footer>
                <Link to={`/${marginToken.symbol}/broker/rank`}>
                  {t('Broker.BV.BrokerRank', 'Broker Rank')} #{brokerRanking}
                </Link>
              </footer>
            </main>
            <hr />
            <main>
              <header>{t('Broker.BV.DailyActiveTrader', 'Daily Active Trader')}</header>
              <section>{brokerRewardsToday.traders_num}</section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.Transactions', '', {
                    data: brokerRewardsToday.txs_num
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
                <BalanceShow
                  value={brokerRewardsToday.margin_token_reward}
                  unit={marginToken.symbol}
                  decimal={Number(brokerRewardsToday.margin_token_reward) === 0 ? 2 : marginToken.decimals}
                />
                <BalanceShow value={brokerRewardsToday.drf_reward} unit={PLATFORM_TOKEN.symbol} />
              </section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.TotalRewards', '', {
                    data: `${(brokerRewardsToday.margin_token_reward_rate * 100).toFixed(2)}%`
                  })
                }}
              />
            </main>
            <main>
              <header>{t('Broker.BV.DailyActiveTrader', 'Daily Active Trader')}</header>
              <section>{brokerRewardsToday.traders_num}</section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.Transactions', '', {
                    data: brokerRewardsToday.txs_num
                  })
                }}
              />
            </main>
            <main>
              <header>{t('Broker.BV.BrokerRank', 'Broker Rank')}</header>
              <section>#{brokerRanking}</section>
              <footer>
                <Link to={`/${marginToken.symbol}/broker/rank`}>{t('Broker.BV.RankList', 'Rank List')}</Link>
              </footer>
            </main>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
