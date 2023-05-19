import { useTranslation } from 'react-i18next'
import React, { FC, useContext, useMemo } from 'react'
import { MobileContext } from '@/providers/Mobile'
import { isLTET, keepDecimals } from '@/utils/tools'
import { useDerivativeListStore } from '@/store/useDerivativeList'
import { useCurrentOpenInterest } from '@/hooks/useCurrentOpenInterest'
import { usePositionChangeFeeRatios } from '@/hooks/usePositionChangeFeeRatios'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { useMarginTokenStore, useQuoteTokenStore, useMarginIndicatorsStore } from '@/store'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import QuestionPopover from '@/components/common/QuestionPopover'

const HeaderData: FC = () => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)

  const { data: pcfRatios } = usePositionChangeFeeRatios(derAddressList)
  const { data: currentOpenInterest } = useCurrentOpenInterest(quoteToken.address, marginToken.address)

  const ratio = useMemo(() => {
    const _ = pcfRatios?.[quoteToken.symbol] ?? 0
    return [_, Number(_) === 0 ? 2 : 4]
  }, [pcfRatios, quoteToken])

  const pmrRate = useMemo(() => {
    if (marginIndicators) {
      const match = marginIndicators[quoteToken.address]
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
      const m = long_position_amount - short_position_amount
      const n = long_position_amount + short_position_amount
      const x = (m / n).toFixed(4)
      return [m, n === 0 || m === 0 ? 0 : x]
    }
    return [0, 0]
  }, [currentOpenInterest])

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
            (<BalanceShow value={interest[0]} unit={marginToken.symbol} />)
          </strong>
        ) : (
          <>
            <BalanceShow value={interest[1]} percent />
            <small>
              ({keepDecimals(interest[0], 2)} {marginToken.symbol})
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
