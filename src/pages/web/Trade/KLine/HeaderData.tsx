import { useTranslation } from 'react-i18next'
import React, { FC, useContext, useEffect, useMemo } from 'react'

import { findToken } from '@/config/tokens'
import { isLTET, keepDecimals } from '@/utils/tools'
import { MobileContext } from '@/providers/Mobile'
import { usePCFRatioConf } from '@/hooks/useMatchConf'
import { useCurrentPositionsAmount } from '@/hooks/useQueryApi'
import { useMarginToken, usePairsInfo, useQuoteToken } from '@/store'

import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

const HeaderData: FC = () => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const indicators = usePairsInfo((state) => state.indicators)
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)

  const { pcfRatio, pcfRatiosLoaded } = usePCFRatioConf(quoteToken, marginToken)
  const { data: positionsAmount, refetch } = useCurrentPositionsAmount(
    findToken(quoteToken).tokenAddress,
    findToken(marginToken).tokenAddress
  )

  const memoPosFeeRatio = useMemo(() => {
    if (pcfRatio || Number(pcfRatio) >= 0) return pcfRatio
    return '0'
  }, [pcfRatio])

  const memoPositionApy = useMemo(() => {
    const match = indicators?.[quoteToken]
    const longPmrRate = match?.longPmrRate ?? 0
    const shortPmrRate = match?.shortPmrRate ?? 0
    return [
      keepDecimals(isLTET(longPmrRate, 0) ? 0 : longPmrRate, 4),
      keepDecimals(isLTET(shortPmrRate, 0) ? 0 : shortPmrRate, 4)
    ]
  }, [quoteToken, indicators])

  const positionInfo = useMemo(() => {
    if (positionsAmount) {
      const { long_position_amount = 0, short_position_amount = 0 } = positionsAmount
      const m = long_position_amount - short_position_amount
      const n = long_position_amount + short_position_amount
      const x = (m / n).toFixed(4)
      return [m, n === 0 || m === 0 ? 0 : x]
    }
    return [0, 0]
  }, [positionsAmount])

  useEffect(() => {
    void refetch()
  }, [quoteToken, marginToken])

  return (
    <div className="web-trade-kline-header-data">
      <section>
        <h3>
          {t('Trade.kline.NetPositionRate', 'Net Position Rate')}
          <QuestionPopover size="mini" text={t('Trade.kline.NetPositionRateTip')} />
        </h3>
        {!mobile ? (
          <strong>
            <BalanceShow value={positionInfo[1]} percent />
            (<BalanceShow value={positionInfo[0]} unit={marginToken} />)
          </strong>
        ) : (
          <>
            <BalanceShow value={positionInfo[1]} percent />
            <small>
              ({keepDecimals(positionInfo[0], findToken(marginToken).decimals)} {marginToken})
            </small>
          </>
        )}
      </section>
      {!mobile && <hr />}
      <section>
        <h3>
          {t('Trade.kline.PCFRate', 'PCF Rate')}
          <QuestionPopover size="mini" text={t('Trade.kline.PCFRateTip')} />
        </h3>
        <strong>
          <BalanceShow value={memoPosFeeRatio} decimal={!pcfRatiosLoaded ? 2 : 4} percent />
        </strong>
      </section>
      {!mobile && <hr />}
      <section>
        <h3>
          {t('Trade.kline.PositionMiningAPY', 'Position Mining APR.')}
          <QuestionPopover size="mini" text={t('Trade.kline.PositionMiningAPYTip')} />
        </h3>
        {mobile ? (
          <>
            <aside>
              <strong>
                <BalanceShow value={memoPositionApy[0]} percent />
              </strong>
              <small>Long</small>
            </aside>
            <aside>
              <strong>
                <BalanceShow value={memoPositionApy[1]} percent />
              </strong>
              <small>Short</small>
            </aside>
          </>
        ) : (
          <strong>
            <BalanceShow value={memoPositionApy[0]} percent />
            <em />
            <small>Long</small>
            <em>/</em>
            <BalanceShow value={memoPositionApy[1]} percent />
            <em />
            <small>Short</small>
          </strong>
        )}
      </section>
    </div>
  )
}

export default HeaderData
