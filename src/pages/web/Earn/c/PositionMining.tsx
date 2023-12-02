import { useAtomValue, useSetAtom } from 'jotai'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import { asyncTraderVariablesAtom, traderVariablesAtom } from '@/atoms/useTraderVariables'
import Button from '@/components/common/Button'
import DecimalShow from '@/components/common/DecimalShow'
import QuestionPopover from '@/components/common/QuestionPopover'
import { Link } from '@/components/common/Route'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import NotConnect from '@/components/web/NotConnect'
import tokens, { PLATFORM_TOKEN } from '@/config/tokens'
import { useCurrentPositionsTotalAmount } from '@/hooks/useCurrentPositionsTotalAmount'
import { useMiningOperation } from '@/hooks/useMiningOperation'
import { usePoolEarning } from '@/hooks/usePoolEarning'
import { useMarginTokenStore, useMarginIndicatorsStore, useProtocolConfigStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { bnPlus, isGT, isLT, keepDecimals, numeralNumber } from '@/utils/tools'

const PositionMining: FC = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const indicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const variables = useAtomValue(traderVariablesAtom)
  const asyncTraderVariables = useSetAtom(
    asyncTraderVariablesAtom({
      userAccount: address,
      exchange: protocolConfig?.exchange
    })
  )
  const { data: rewardsInfo } = usePoolEarning(address, protocolConfig?.rewards)
  const { data: totalAmount } = useCurrentPositionsTotalAmount('all', marginToken.address)
  const { withdrawPositionReward } = useMiningOperation()

  const ratio = useMemo(() => {
    if (indicators) {
      const values = Object.values(indicators)
      const apyMax = values.map((d) => Math.max(Number(d.longPmrRate), Number(d.shortPmrRate)))
      return Math.max.apply(null, apyMax) * 100
    }
    return '0'
  }, [indicators])

  const volume = useMemo(() => {
    if (totalAmount) {
      const { long_position_amount = 0, short_position_amount = 0 } = totalAmount
      return bnPlus(long_position_amount, short_position_amount)
    }
    return '0'
  }, [totalAmount])

  const rewards = useMemo(() => {
    const drfBalance = rewardsInfo?.drfBalance ?? 0
    const marginTokenBalance = rewardsInfo?.marginTokenBalance ?? 0
    const drfAccumulatedBalance = rewardsInfo?.drfAccumulatedBalance ?? 0
    const marginTokenAccumulatedBalance = rewardsInfo?.marginTokenAccumulatedBalance ?? 0
    return { drfBalance, marginTokenBalance, drfAccumulatedBalance, marginTokenAccumulatedBalance }
  }, [rewardsInfo])

  const disabled = useMemo(
    () => isGT(rewards.drfBalance, 0) || isGT(rewards.marginTokenBalance, 0) || !protocolConfig,
    [rewards, protocolConfig]
  )

  const positions = useMemo(() => {
    const p1 = variables.data.totalPositionAmount
    const p2 = Number(p1) === 0 ? 2 : marginToken.decimals
    return [p1, p2]
  }, [variables, marginToken])

  const withdrawFunc = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending'))
    const status = await withdrawPositionReward(protocolConfig?.rewards, signer)
    if (status) {
      // succeed
      window.toast.success(t('common.success'))
    } else {
      // fail
      window.toast.error(t('common.failed'))
    }
    window.toast.dismiss(toast)
  }, [signer, protocolConfig])

  useEffect(() => {
    if (address && protocolConfig) void asyncTraderVariables()
  }, [address, protocolConfig])

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
          <DecimalShow value={numeralNumber(ratio, 2)} percent suffix="(max)" />
          <u>APR.</u>
        </div>
        <div className="web-eran-item-claim">
          <main>
            <h4>{t('Earn.PositionMining.Claimable', 'Claimable')}</h4>
            <BalanceShow
              value={rewards.marginTokenBalance}
              unit={marginToken.symbol}
              decimal={Number(rewards.marginTokenBalance) === 0 ? 2 : marginToken.decimals}
            />
            <BalanceShow
              value={rewards.drfBalance}
              unit={PLATFORM_TOKEN.symbol}
              decimal={!rewardsInfo ? 2 : isLT(rewards.drfBalance, 1) && isGT(rewards.drfBalance, 0) ? 8 : 2}
            />
            <p>
              {t('Earn.PositionMining.TotalEarned')}{' '}
              <strong>{keepDecimals(rewards.marginTokenAccumulatedBalance, 2)}</strong> {marginToken.symbol}{' '}
              {t('Earn.PositionMining.And', 'and')}{' '}
              <strong>{keepDecimals(rewards.drfAccumulatedBalance, tokens.drf.decimals)}</strong> DRF
            </p>
          </main>
          <aside>
            <Button size={isMobile ? 'mini' : 'default'} disabled={!disabled} onClick={withdrawFunc}>
              {t('Earn.PositionMining.ClaimAll', 'Claim All')}
            </Button>
            <Link to={`/${marginToken.symbol}/mining/rank`}>{t('Broker.BV.RankList')}</Link>
          </aside>
        </div>
        <div className="web-eran-item-card">
          <main>
            <h4>{t('Earn.PositionMining.Positions')}</h4>
            <BalanceShow value={positions[0]} unit={marginToken.symbol} decimal={positions[1] as number} />
            <div className="block" />
            <p>
              {t('Earn.PositionMining.TotalPositions')}{' '}<strong>{numeralNumber(volume, marginToken.decimals)}</strong>{' '}
              {marginToken.symbol}
            </p>
          </main>
          <aside>
            <Button size={isMobile ? 'mini' : 'default'} to={`/${marginToken.symbol}/trade`}>
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
