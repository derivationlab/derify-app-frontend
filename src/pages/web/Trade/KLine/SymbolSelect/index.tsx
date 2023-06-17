import classNames from 'classnames'

import React, { FC, useState, useRef, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'react-use'

import ChangePercent from '@/components/common/ChangePercent'
import Skeleton from '@/components/common/Skeleton'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { MobileContext } from '@/providers/Mobile'
import { useMarginIndicatorsStore, useQuoteTokenStore, useTokenSpotPricesStore } from '@/store'
import { QuoteTokenState } from '@/store/types'

import Options from './Options'

interface Props {
  onToggle?: () => void
}

const SymbolSelect: FC<Props> = ({ onToggle }) => {
  const ref = useRef(null)
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)

  const [showOptions, setShowOptions] = useState<boolean>(false)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[quoteToken.symbol] ?? '0'
  }, [quoteToken, tokenSpotPrices])

  const indicator = useMemo(() => {
    return marginIndicators?.[quoteToken.token]?.price_change_rate ?? 0
  }, [quoteToken, marginIndicators])

  const change = (pair: Record<string, any>) => {
    setShowOptions(false)
    const { name, token, price_decimals } = pair
    updateQuoteToken({ symbol: name, token, decimals: price_decimals })
  }

  const toggle = () => {
    setShowOptions(false)
    onToggle?.()
  }

  useClickAway(ref, () => setShowOptions(false))

  return (
    <div className={classNames('web-trade-symbol-select', { show: showOptions })} ref={ref}>
      {mobile && <div className="web-trade-symbol-select-toggle" onClick={toggle} />}
      {quoteToken.symbol ? (
        <div className="web-trade-symbol-select-curr" onClick={() => setShowOptions(!showOptions)}>
          <h4>{quoteToken.symbol}</h4>
          <aside>
            <Skeleton rowsProps={{ rows: 1 }} animation loading={!tokenSpotPrices}>
              <BalanceShow value={spotPrice} decimal={Number(spotPrice) === 0 ? 2 : quoteToken.decimals} />
            </Skeleton>
            <ChangePercent value={indicator} />
          </aside>
        </div>
      ) : (
        <div className="web-trade-symbol-select-curr s">{t('Trade.Derivative.NoTrading')}</div>
      )}
      {showOptions && <Options onChange={change} />}
    </div>
  )
}

export default SymbolSelect
