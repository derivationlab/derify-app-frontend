import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import Button from '@/components/common/Button'
import DecimalShow from '@/components/common/DecimalShow'
import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import NotConnect from '@/components/web/NotConnect'
import tokens, { PLATFORM_TOKEN } from '@/config/tokens'
import { useCurrentOpenInterest } from '@/hooks/useCurrentOpenInterest'
import { useMiningOperation } from '@/hooks/useMiningOperation'
import { usePoolEarning } from '@/hooks/usePoolEarning'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenStore, useTraderVariablesStore, useMarginIndicatorsStore, useProtocolConfigStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { bnPlus, isGT, isLT, keepDecimals, numeralNumber } from '@/utils/tools'

const PositionMining: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { mobile } = useContext(MobileContext)

  const variables = useTraderVariablesStore((state) => state.variables)
  const variablesLoaded = useTraderVariablesStore((state) => state.variablesLoaded)
  const indicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)

  const { withdrawPositionReward } = useMiningOperation()
  const { data: rewardsInfo } = usePoolEarning(address, protocolConfig?.rewards)
  const { data: currentOpenInterest } = useCurrentOpenInterest('all', marginToken.address)

  const memoPositionApy = useMemo(() => {
    if (indicators) {
      const apy = Object.values(indicators).map((d) => Math.max(Number(d.longPmrRate), Number(d.shortPmrRate)))
      return Math.max.apply(null, apy) * 100
    }
    return '0'
  }, [indicators])

  const memoPositionsAm = useMemo(() => {
    if (currentOpenInterest) {
      const { long_position_amount = 0, short_position_amount = 0 } = currentOpenInterest
      return bnPlus(long_position_amount, short_position_amount)
    }
    return '0'
  }, [currentOpenInterest])

  const memoDisabled = useMemo(() => {
    return isGT(rewardsInfo?.drfBalance ?? 0, 0) || isGT(rewardsInfo?.marginTokenBalance ?? 0, 0)
  }, [rewardsInfo])

  const withdrawFunc = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (protocolConfig) {
      const status = await withdrawPositionReward(protocolConfig.rewards, signer)
      if (status) {
        // succeed
        window.toast.success(t('common.success', 'success'))
      } else {
        // fail
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    window.toast.dismiss(toast)
  }, [signer])

  const decimals1 = useMemo(() => {
    return Number(rewardsInfo?.marginTokenBalance ?? 0) === 0 ? 2 : marginToken.decimals
  }, [rewardsInfo, marginToken])

  const decimals2 = useMemo(() => {
    return Number(variables?.totalPositionAmount ?? 0) === 0 ? 2 : marginToken.decimals
  }, [variables, marginToken])

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
          <DecimalShow value={numeralNumber(memoPositionApy, 2)} percent suffix="(max)" />
          <u>APR.</u>
        </div>
        <div className="web-eran-item-claim">
          <main>
            <h4>{t('Earn.PositionMining.Claimable', 'Claimable')}</h4>
            <BalanceShow value={rewardsInfo?.marginTokenBalance ?? 0} unit={marginToken.symbol} decimal={decimals1} />
            <BalanceShow
              value={rewardsInfo?.drfBalance ?? 0}
              unit={PLATFORM_TOKEN.symbol}
              decimal={
                !variablesLoaded
                  ? 2
                  : isLT(rewardsInfo?.drfBalance ?? 0, 1) && isGT(rewardsInfo?.drfBalance ?? 0, 0)
                  ? 8
                  : 2
              }
            />
            <p>
              {t('Earn.PositionMining.TotalEarned')}{' '}
              <strong>{keepDecimals(rewardsInfo?.marginTokenAccumulatedBalance ?? 0, 2)}</strong> {marginToken.symbol}{' '}
              {t('Earn.PositionMining.And', 'and')}{' '}
              <strong>{keepDecimals(rewardsInfo?.drfAccumulatedBalance ?? 0, tokens.drf.decimals)}</strong> DRF
            </p>
          </main>
          <aside>
            <Button size={mobile ? 'mini' : 'default'} disabled={!memoDisabled} onClick={withdrawFunc}>
              {t('Earn.PositionMining.ClaimAll', 'Claim All')}
            </Button>
            <Link to={`/${marginToken.symbol}/mining/rank`}>{t('Broker.BV.RankList')}</Link>
          </aside>
        </div>
        <div className="web-eran-item-card">
          <main>
            <h4>{t('Earn.PositionMining.Positions')}</h4>
            <BalanceShow value={variables?.totalPositionAmount ?? 0} unit={marginToken.symbol} decimal={decimals2} />
            <div className="block" />
            <p>
              {t('Earn.PositionMining.TotalPositions')}{' '}
              <strong>{numeralNumber(memoPositionsAm, marginToken.decimals)}</strong> {marginToken.symbol}
            </p>
          </main>
          <aside>
            <Button size={mobile ? 'mini' : 'default'} to={`/${marginToken.symbol}/trade`}>
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
