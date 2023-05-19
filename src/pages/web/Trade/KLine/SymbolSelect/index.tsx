import classNames from 'classnames'

import React, { FC, useState, useRef, useContext, useMemo } from 'react'
import { useClickAway } from 'react-use'

import ChangePercent from '@/components/common/ChangePercent'
import Skeleton from '@/components/common/Skeleton'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { MobileContext } from '@/providers/Mobile'
import { useMarginIndicatorsStore, useQuoteTokenStore, useTokenSpotPricesStore } from '@/store'

import Options from './Options'

interface Props {
  onToggle?: () => void
}

const SymbolSelect: FC<Props> = ({ onToggle }) => {
  const ref = useRef(null)

  const { mobile } = useContext(MobileContext)

  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const updateQuoteToken = useQuoteTokenStore((state) => state.updateQuoteToken)

  const [showOptions, setShowOptions] = useState<boolean>(false)

  const spotPrice = useMemo(() => {
    return tokenSpotPrices?.[quoteToken.symbol] ?? '0'
  }, [quoteToken, tokenSpotPrices])

  const indicator = useMemo(() => {
    return marginIndicators?.[quoteToken.address]?.price_change_rate ?? 0
  }, [quoteToken, marginIndicators])

  const change = (pair: Record<string, any>) => {
    setShowOptions(false)

    updateQuoteToken(pair.symbol)
  }

  const toggle = () => {
    setShowOptions(false)
    onToggle?.()
  }

  useClickAway(ref, () => setShowOptions(false))

  return (
    <div className={classNames('web-trade-symbol-select', { show: showOptions })} ref={ref}>
      {mobile && <div className="web-trade-symbol-select-toggle" onClick={toggle} />}
      <div className="web-trade-symbol-select-curr" onClick={() => setShowOptions(!showOptions)}>
        <h4>{quoteToken.symbol}</h4>
        <aside>
          <Skeleton rowsProps={{ rows: 1 }} animation loading={!tokenSpotPrices}>
            <BalanceShow value={Number(spotPrice).toFixed(2)} />
          </Skeleton>
          <ChangePercent value={indicator} />
        </aside>
      </div>
      {showOptions && <Options onChange={change} />}
    </div>
  )
}

export default SymbolSelect
