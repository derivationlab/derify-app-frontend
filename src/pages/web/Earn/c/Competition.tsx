import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext } from 'react'

import { findToken } from '@/config/tokens'
import { PubSubEvents } from '@/typings'
import { useQuoteToken } from '@/zustand'
import { MobileContext } from '@/providers/Mobile'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { isGT, keepDecimals } from '@/utils/tools'
import { useTraderBondBalance } from '@/hooks/useQueryApi'
import { useWithdrawRankReward } from '@/hooks/useEarning'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import QuestionPopover from '@/components/common/QuestionPopover'
import { useRankReward } from '@/hooks/useDashboard'

const Competition: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { mobile } = useContext(MobileContext)

  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const rewardsInfo = useTraderInfo((state) => state.rewardsInfo)

  const marginToken = useMTokenFromRoute()

  const { withdraw } = useWithdrawRankReward()
  const { protocolConfig } = useProtocolConf(quoteToken, marginToken)
  const { data: bondBalance } = useTraderBondBalance(address, findToken(marginToken).tokenAddress)

  useRankReward(address, protocolConfig?.rewards)

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
          <DecimalShow value={(rewardsInfo?.bondAnnualInterestRatio ?? 999) * 100} percent />
          <u>RANK.</u>
        </div>
        <div className="web-eran-item-claim">
          <main>
            <h4>{t('Earn.PositionMining.Claimable')}</h4>
            <BalanceShow value={bondBalance ?? 0} unit={marginToken} decimal={findToken(marginToken).decimals} />
            <div className="block" />
            <p>
              {t('Earn.PositionMining.TotalEarned')} :{' '}
              <strong>{keepDecimals(rewardsInfo?.exchangeable ?? 999, 2)}</strong> {marginToken}
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
            <BalanceShow value={rewardsInfo?.bondReturnBalance ?? 999} unit={marginToken} />
            <div className="block" />
            <p>
              Active grants : <strong>{999}</strong>
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
