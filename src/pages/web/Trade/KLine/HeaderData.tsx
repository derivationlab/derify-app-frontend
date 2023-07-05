import React, { FC, useContext, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import QuestionPopover from '@/components/common/QuestionPopover'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { useCurrentOpenInterest } from '@/hooks/useCurrentOpenInterest'
import { usePositionChangeFeeRatios } from '@/hooks/usePositionChangeFeeRatios'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenStore, useQuoteTokenStore, useMarginIndicatorsStore } from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { useDerivativeListStore } from '@/store/useDerivativeList'
import { bnDiv, bnMinus, bnPlus, isLTET, keepDecimals, numeralNumber } from '@/utils/tools'

const HeaderData: FC = () => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const { data: pcfRatios } = usePositionChangeFeeRatios(derivativeList)
  const { data: currentOpenInterest, refetch: refetchCurrentOpenInterest } = useCurrentOpenInterest(
    quoteToken.token,
    marginToken.address
  )

  const ratio = useMemo(() => {
    const _ = pcfRatios?.[quoteToken.name] ?? 0
    return [_, Number(_) === 0 ? 2 : 4]
  }, [pcfRatios, quoteToken])

  const pmrRate = useMemo(() => {
    if (marginIndicators) {
      const match = marginIndicators[quoteToken.token]
      const longPmrRate = match?.longPmrRate ?? 0
      const shortPmrRate = match?.shortPmrRate ?? 0
      return [
        keepDecimals(isLTET(longPmrRate, 0) ? 0 : longPmrRate, 4),
        keepDecimals(isLTET(shortPmrRate, 0) ? 0 : shortPmrRate, 4)
      ]
    }
    return [keepDecimals(0, 4), keepDecimals(0, 4)]
  }, [quoteToken, marginIndicators])

  const interest = useMemo(() => {
    if (currentOpenInterest) {
      const { long_position_amount = 0, short_position_amount = 0 } = currentOpenInterest
      const m = bnMinus(long_position_amount, short_position_amount)
      const n = bnPlus(long_position_amount, short_position_amount)
      const x = keepDecimals(bnDiv(m, n), 4)
      return [m, Number(n) === 0 || Number(m) === 0 ? 0 : x]
    }
    return [0, 0]
  }, [currentOpenInterest])

  useEffect(() => {
    void refetchCurrentOpenInterest()
  }, [quoteToken.token, marginToken.address])

  return (
    <div className="web-trade-kline-header-data">
      <section>
        <h3>
          {t('Trade.kline.NetPositionRate', 'Net Position Rate')}
          <QuestionPopover size="mini" text={t('Trade.kline.NetPositionRateTip')} />
        </h3>
        {!mobile ? (
          <strong>
            <BalanceShow value={interest[1]} percent />
            (
            <BalanceShow
              value={interest[0]}
              unit={marginToken.symbol}
              decimal={Number(interest[0]) === 0 ? 2 : marginToken.decimals}
            />
            )
          </strong>
        ) : (
          <>
            <BalanceShow value={interest[1]} percent />
            <small>
              ({numeralNumber(interest[0], marginToken.decimals)} {marginToken.symbol})
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
          <BalanceShow value={ratio[0]} decimal={ratio[1]} percent />
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
                <BalanceShow value={pmrRate[0]} percent />
              </strong>
              <small>Long</small>
            </aside>
            <aside>
              <strong>
                <BalanceShow value={pmrRate[1]} percent />
              </strong>
              <small>Short</small>
            </aside>
          </>
        ) : (
          <strong>
            <BalanceShow value={pmrRate[0]} percent />
            <em />
            <small>Long</small>
            <em>/</em>
            <BalanceShow value={pmrRate[1]} percent />
            <em />
            <small>Short</small>
          </strong>
        )}
      </section>
    </div>
  )
}

export default HeaderData
