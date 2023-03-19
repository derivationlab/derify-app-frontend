import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext, useEffect } from 'react'

import { findToken, PLATFORM_TOKEN } from '@/config/tokens'
import { PubSubEvents } from '@/typings'
import { useRankReward } from '@/hooks/useDashboard'
import { MobileContext } from '@/providers/Mobile'
import { useProtocolConf } from '@/hooks/useMatchConf'

import { bnMul, isGT, keepDecimals } from '@/utils/tools'
import {
  useActiveRankGrantCount,
  useActiveRankGrantRatios,
  useActiveRankGrantTotalAmount,
  useTraderBondBalance
} from '@/hooks/useQueryApi'
import { useWithdrawRankReward } from '@/hooks/useEarning'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import QuestionPopover from '@/components/common/QuestionPopover'
import { useMarginToken } from '@/store'

const Competition: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()

  const { mobile } = useContext(MobileContext)
  const marginToken = useMarginToken((state) => state.marginToken)

  const { withdraw } = useWithdrawRankReward()
  const { protocolConfig } = useProtocolConf(marginToken)
  const { data, refetch } = useRankReward(address, protocolConfig?.rewards)
  const { data: grantRatio } = useActiveRankGrantRatios(findToken(marginToken).tokenAddress)
  const { data: bondBalance } = useTraderBondBalance(address, findToken(marginToken).tokenAddress)
  const { data: grantAmount } = useActiveRankGrantTotalAmount(findToken(marginToken).tokenAddress)
  const { data: activeGrant } = useActiveRankGrantCount(findToken(marginToken).tokenAddress)

  const memoDisabled = useMemo(() => {
    return isGT(bondBalance ?? 0, 0)
  }, [bondBalance])

  const withdrawFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (protocolConfig) {
      const status = await withdraw(protocolConfig.rewards)
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
  }

  useEffect(() => {
    if (address && protocolConfig) void refetch()
  }, [address, protocolConfig])

  return (
    <div className="web-eran-item">
      <header className="web-eran-item-header">
        <h3>
          Trading Competition
          <QuestionPopover text="根据历史累计收益计算该保证金每个用户（保证金/DRF的累积收益值>0）的排名" />
        </h3>
        <p>Join trading competition to earn rewards</p>
      </header>
      <section className="web-eran-item-main">
        <div className="web-eran-item-dashboard">
          <DecimalShow value={keepDecimals(bnMul(grantRatio, 100), 2)} percent />
          <u>RANK.</u>
        </div>
        <div className="web-eran-item-claim">
          <main>
            <h4>{t('Earn.PositionMining.Claimable')}</h4>
            <BalanceShow value={data?.drfBalance ?? 0} unit={PLATFORM_TOKEN.symbol} />
            <div className="block" />
            <p>
              {t('Earn.PositionMining.TotalEarned')} :{' '}
              <strong>{keepDecimals(data?.drfAccumulatedBalance ?? 0, PLATFORM_TOKEN.decimals)}</strong>{' '}
              {PLATFORM_TOKEN.symbol}
            </p>
          </main>
          <aside>
            <Button size={mobile ? 'mini' : 'default'} disabled={!memoDisabled} onClick={withdrawFunc}>
              {t('Earn.bDRFPool.ClaimAll', 'Claim All')}
            </Button>
          </aside>
        </div>
        <div className="web-eran-item-card">
          <main>
            <h4>Rewards pool</h4>
            <BalanceShow value={grantAmount.totalAmount} unit={PLATFORM_TOKEN.symbol} />
            <div className="block" />
            <p>
              Active grants : <strong>{activeGrant.count}</strong>
            </p>
          </main>
          <aside>
            <Button size={mobile ? 'mini' : 'default'} to={`/${marginToken}/trade`}>
              Trade
            </Button>
          </aside>
        </div>
        <NotConnect />
      </section>
    </div>
  )
}

export default Competition
