import { useTranslation } from 'react-i18next'
import React, { FC, useContext, useEffect, useMemo } from 'react'

import { findToken } from '@/config/tokens'
import { keepDecimals } from '@/utils/tools'
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

  const { pcfRatio } = usePCFRatioConf(quoteToken, marginToken)
  const { data: positionsAmount, refetch } = useCurrentPositionsAmount(
    findToken(quoteToken).tokenAddress,
    findToken(marginToken).tokenAddress
  )

  const memoPosFeeRatio = useMemo(() => {
    if (pcfRatio || Number(pcfRatio) >= 0) return pcfRatio
    return '0'
  }, [pcfRatio])

  const memoPositionApy = useMemo(() => {
    const longPmrRate = indicators?.longPmrRate ?? 0
    const shortPmrRate = indicators?.shortPmrRate ?? 0
    return [
      Number(longPmrRate) <= 0 ? '0.00' : keepDecimals(longPmrRate * 100, 2),
      Number(shortPmrRate) <= 0 ? '0.00' : keepDecimals(shortPmrRate * 100, 2)
    ]
  }, [indicators])

  const positionInfo = useMemo(() => {
    if (positionsAmount) {
      const { long_position_amount = 0, short_position_amount = 0 } = positionsAmount
      const m = long_position_amount - short_position_amount
      const n = long_position_amount + short_position_amount
      const x = ((m / n) * 100).toFixed(2)
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
          <BalanceShow value={memoPosFeeRatio} percent />
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
