import { useTranslation } from 'react-i18next'
import React, { FC, useContext, useMemo } from 'react'

import { MobileContext } from '@/context/Mobile'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useProtocolConf } from '@/hooks/useMatchConf'
import tokens, { findToken } from '@/config/tokens'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { useWithdrawPositionReward } from '@/hooks/useEarning'
import { useCurrentPositionsAmount } from '@/hooks/useQueryApi'
import { bnPlus, isGT, keepDecimals } from '@/utils/tools'
import { usePairsInfo, useQuoteToken } from '@/zustand'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import QuestionPopover from '@/components/common/QuestionPopover'

const PositionMining: FC = () => {
  const { t } = useTranslation()

  const { mobile } = useContext(MobileContext)

  const variables = useTraderInfo((state) => state.variables)
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const indicators = usePairsInfo((state) => state.indicators)
  const rewardsInfo = useTraderInfo((state) => state.rewardsInfo)
  const indicatorsLoaded = usePairsInfo((state) => state.indicatorsLoaded)

  const marginToken = useMTokenFromRoute()

  const { withdraw } = useWithdrawPositionReward()
  const { protocolConfig } = useProtocolConf(quoteToken, marginToken)
  const { data: positionsAmount } = useCurrentPositionsAmount('all', findToken(marginToken).tokenAddress)

  const memoPositionApy = useMemo(() => {
    if (indicatorsLoaded) {
      const apy = Object.values(indicators).map((d) => Math.max(Number(d.longPmrRate), Number(d.shortPmrRate)))
      return Math.max.apply(null, apy) * 100
    }
    return '0'
  }, [indicatorsLoaded, indicators])

  const memoPositionsAm = useMemo(() => {
    if (positionsAmount) {
      const { long_position_amount, short_position_amount } = positionsAmount
      return bnPlus(long_position_amount, short_position_amount)
    }
    return '0'
  }, [positionsAmount])

  const memoDisabled = useMemo(() => {
    return isGT(rewardsInfo?.drfBalance ?? 0, 0) || isGT(rewardsInfo?.marginTokenBalance ?? 0, 0)
  }, [rewardsInfo])

  const withdrawFunc = async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (protocolConfig) {
      const status = await withdraw(protocolConfig.rewards)
      if (status) {
        // succeed
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
          <u>APR.</u>
        </div>
        <div className="web-eran-item-claima">
          <main>
            <h4>{t('Earn.PositionMining.Claimable', 'Claimable')}</h4>
            <BalanceShow
              value={rewardsInfo?.marginTokenBalance ?? 0}
              unit={marginToken}
              decimal={findToken(marginToken).decimals}
            />
            <BalanceShow value={rewardsInfo?.drfBalance ?? 0} unit="DRF" decimal={tokens.drf.decimals} />
            <p>
              {t('Earn.PositionMining.TotalEarned', 'Total earned :')}{' '}
              <strong>
                {keepDecimals(rewardsInfo?.marginTokenAccumulatedBalance ?? 0, findToken(marginToken).decimals)}
              </strong>{' '}
              {marginToken} {t('Earn.PositionMining.And', 'and')}{' '}
              <strong>{keepDecimals(rewardsInfo?.drfAccumulatedBalance ?? 0, tokens.drf.decimals)}</strong> DRF
            </p>
          </main>
          <aside>
            <Button size={mobile ? 'mini' : 'default'} disabled={!memoDisabled} onClick={withdrawFunc}>
              {t('Earn.PositionMining.ClaimAll', 'Claim All')}
            </Button>
          </aside>
        </div>
        <div className="web-eran-item-card">
          <main>
            <h4>{t('Earn.PositionMining.Positions', 'Positions')}</h4>
            <BalanceShow value={variables?.totalPositionAmount ?? 0} unit={marginToken} />
            <div className="block" />
            <p>
              {t('Earn.PositionMining.TotalPositions', 'Total positions')} :{' '}
              <strong>{keepDecimals(memoPositionsAm, findToken(marginToken).decimals)}</strong> {marginToken}
            </p>
          </main>
          <aside>
            <Button size={mobile ? 'mini' : 'default'} to={`/${marginToken}/trade`}>
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
