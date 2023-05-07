import { Link } from 'react-router-dom'
import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useContext, useMemo } from 'react'
import { MobileContext } from '@/providers/Mobile'
import { useProtocolConf } from '@/hooks/useMatchConf'
import { useWithdrawPositionReward } from '@/hooks/useTrading'
import { useCurrentPositionsAmount } from '@/hooks/useQueryApi'
import tokens, { findToken, PLATFORM_TOKEN } from '@/config/tokens'
import { useTraderInfoStore, useMarginTokenStore, usePairsInfoStore } from '@/store'
import { bnPlus, isGT, isLT, keepDecimals, nonBigNumberInterception } from '@/utils/tools'
import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import QuestionPopover from '@/components/common/QuestionPopover'

const PositionMining: FC = () => {
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { mobile } = useContext(MobileContext)

  const variables = useTraderInfoStore((state) => state.variables)
  const indicators = usePairsInfoStore((state) => state.indicators)
  const rewardsInfo = useTraderInfoStore((state) => state.rewardsInfo)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const variablesLoaded = useTraderInfoStore((state) => state.variablesLoaded)
  const indicatorsLoaded = usePairsInfoStore((state) => state.indicatorsLoaded)

  const { withdraw } = useWithdrawPositionReward()
  const { protocolConfig } = useProtocolConf(marginToken)
  const { data: positionsAmount } = useCurrentPositionsAmount('all', findToken(marginToken).tokenAddress)

  const memoPositionApy = useMemo(() => {
    const values = Object.values(indicators)
    if (indicatorsLoaded) {
      const apy = values.map((d) => Math.max(Number(d.longPmrRate), Number(d.shortPmrRate)))
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

  const withdrawFunc = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    if (protocolConfig) {
      const status = await withdraw(protocolConfig.rewards, signer)
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
          <DecimalShow value={keepDecimals(memoPositionApy, 2)} percent suffix="(max)" />
          <u>APR.</u>
        </div>
        <div className="web-eran-item-claim">
          <main>
            <h4>{t('Earn.PositionMining.Claimable', 'Claimable')}</h4>
            <BalanceShow
              value={rewardsInfo?.marginTokenBalance ?? 0}
              unit={marginToken}
              decimal={
                !variablesLoaded
                  ? 2
                  : isLT(rewardsInfo?.marginTokenBalance ?? 0 ?? 0, 1) &&
                    isGT(rewardsInfo?.marginTokenBalance ?? 0 ?? 0, 0)
                  ? 8
                  : 2
              }
            />
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
            <Link to={`/${marginToken}/mining/rank`}>{t('Broker.BV.RankList')}</Link>
          </aside>
        </div>
        <div className="web-eran-item-card">
          <main>
            <h4>{t('Earn.PositionMining.Positions', 'Positions')}</h4>
            <BalanceShow value={nonBigNumberInterception(variables?.totalPositionAmount ?? 0)} unit={marginToken} />
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
