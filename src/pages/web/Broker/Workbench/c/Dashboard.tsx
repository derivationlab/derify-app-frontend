import dayjs from 'dayjs'
import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import tokens, { PLATFORM_TOKEN } from '@/config/tokens'
import { useBrokerAssets } from '@/hooks/useBrokerAssets'
import { useBrokerOperation } from '@/hooks/useBrokerOperation'
import { useMarginTokenStore, useBrokerInfoStore, useProtocolConfigStore } from '@/store'
import { PubSubEvents } from '@/typings'
import { keepDecimals, numeralNumber } from '@/utils/tools'

const Dashboard: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()

  const { withdrawBrokerReward } = useBrokerOperation()

  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

  const { data: brokerAssets } = useBrokerAssets(address, protocolConfig?.rewards)

  const withdrawFunc = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (signer && protocolConfig) {
      const status = await withdrawBrokerReward(signer, protocolConfig.rewards)

      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))

        PubSub.publish(PubSubEvents.UPDATE_BALANCE)
        PubSub.publish(PubSubEvents.UPDATE_BROKER_DAT)
      } else {
        window.toast.error(t('common.failed', 'failed'))
        // failed
      }
    }

    window.toast.dismiss(toast)
  }, [signer, protocolConfig])

  const memoTotalBalance = useMemo(() => {
    const drf = String(brokerAssets?.drfRewardBalance ?? 0)
    const usd = String(brokerAssets?.marginTokenRewardBalance ?? 0)
    return [usd, drf]
  }, [brokerAssets])

  const memoHistoryBalance = useMemo(() => {
    const drf = String(brokerAssets?.accumulatedDrfReward ?? 0)
    const usd = String(brokerAssets?.accumulatedMarginTokenReward ?? 0)
    return [usd, drf]
  }, [brokerAssets])

  const memoDisabled = useMemo(() => {
    const [usd, drf] = memoTotalBalance
    return Number(usd) > 0 || Number(drf) > 0
  }, [memoTotalBalance])

  return (
    <div className="web-broker-dashboard">
      <div className="web-broker-dashboard-balance">
        <section>
          <h3>{t('Broker.BV.BrokerAccountBalance', 'Broker Account Balance')}</h3>
          <BalanceShow
            value={memoTotalBalance[0]}
            unit={marginToken.symbol}
            decimal={Number(memoTotalBalance[0]) === 0 ? 2 : marginToken.decimals}
          />
          <BalanceShow value={memoTotalBalance[1]} unit={PLATFORM_TOKEN.symbol} />
          <p
            dangerouslySetInnerHTML={{
              __html: t('Broker.BV.EarnedTip', '', {
                Amount: numeralNumber(memoHistoryBalance[0], marginToken.decimals),
                Margin: marginToken.symbol,
                DRF: keepDecimals(memoHistoryBalance[1], tokens.drf.decimals),
                time: brokerInfo?.registerTime ? dayjs(brokerInfo?.registerTime).format('MMM DD, YYYY') : '--'
              })
            }}
          />
        </section>
        <Button size={isMobile ? 'mini' : 'default'} onClick={withdrawFunc} disabled={!memoDisabled}>
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
                  value={brokerInfo?.margin_token_reward ?? 0}
                  unit={marginToken.symbol}
                  decimal={Number(brokerInfo?.margin_token_reward ?? 0) === 0 ? 2 : marginToken.decimals}
                />
                <BalanceShow value={brokerInfo?.drf_reward ?? 0} unit={PLATFORM_TOKEN.symbol} />
              </section>
              <footer>
                <Link to={`/${marginToken.symbol}/broker/rank`}>
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
                <BalanceShow
                  value={brokerInfo?.margin_token_reward ?? 0}
                  unit={marginToken.symbol}
                  decimal={Number(brokerInfo?.margin_token_reward ?? 0) === 0 ? 2 : marginToken.decimals}
                />
                <BalanceShow value={brokerInfo?.drf_reward ?? 0} unit={PLATFORM_TOKEN.symbol} />
              </section>
              <footer
                dangerouslySetInnerHTML={{
                  __html: t('Broker.BV.TotalRewards', '', {
                    data: `${((brokerInfo?.margin_token_reward_rate ?? 0) * 100).toFixed(2)}%`
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
