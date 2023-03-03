import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useContext, useMemo } from 'react'

import { usePoolsInfo } from '@/zustand/usePoolsInfo'
import { MobileContext } from '@/context/Mobile'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { bnPlus, isGT, nonBigNumberInterception } from '@/utils/tools'
import { useMarginToken, usePairsInfo, useQuoteToken } from '@/zustand'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import QuestionPopover from '@/components/common/QuestionPopover'
import { useWithdrawPositionReward } from '@/hooks/useEarning'
import { useProtocolConf1 } from '@/hooks/useMatchConf'

const PositionMining: FC = () => {
  const { t } = useTranslation()

  const { mobile } = useContext(MobileContext)

  const variables = useTraderInfo((state) => state.variables)
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const indicators = usePairsInfo((state) => state.indicators)
  const marginToken = useMarginToken((state) => state.marginToken)
  const rewardsInfo = useTraderInfo((state) => state.rewardsInfo)
  const positionsAmount = usePoolsInfo((state) => state.positionsAmount)
  const indicatorsLoaded = usePairsInfo((state) => state.indicatorsLoaded)

  // console.info(variables)
  // console.info(positionsAmount)

  const { withdraw } = useWithdrawPositionReward()
  const { protocolConfig } = useProtocolConf1(quoteToken, marginToken)

  const memoPositionApy = useMemo(() => {
    if (indicatorsLoaded) {
      const apy = Object.values(indicators).map((d) => Math.max(Number(d.longPmrRate), Number(d.shortPmrRate)))
      const max = String(Math.max.apply(null, apy) * 100)
      return nonBigNumberInterception(max)
    }
    return '0'
  }, [indicatorsLoaded, indicators])

  const memoPositionsAm = useMemo(() => {
    if (!isEmpty(positionsAmount)) {
      const { long_position_amount, short_position_amount } = positionsAmount
      const s = bnPlus(long_position_amount, short_position_amount)
      return nonBigNumberInterception(s)
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
            <BalanceShow value={rewardsInfo?.marginTokenBalance ?? 0} unit={marginToken} decimal={4} />
            <BalanceShow value={rewardsInfo?.drfBalance ?? 0} unit="DRF" decimal={4} />
            <p>
              {t('Earn.PositionMining.TotalEarned', 'Total earned :')}{' '}
              <strong>{rewardsInfo?.marginTokenAccumulatedBalance ?? 0}</strong> {marginToken}{' '}
              {t('Earn.PositionMining.And', 'and')} <strong>{rewardsInfo?.drfAccumulatedBalance ?? 0}</strong> DRF
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
              {t('Earn.PositionMining.TotalPositions', 'Total positions')} : <strong>{memoPositionsAm}</strong>{' '}
              {marginToken}
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
