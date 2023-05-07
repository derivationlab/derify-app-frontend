import classNames from 'classnames'
import { useClickAway } from 'react-use'
import React, { FC, useState, useRef, useContext } from 'react'
import { keepDecimals } from '@/utils/tools'
import { MobileContext } from '@/providers/Mobile'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useMarginTokenStore, usePairsInfoStore, useQuoteTokenStore } from '@/store'
import Skeleton from '@/components/common/Skeleton'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import ChangePercent from '@/components/common/ChangePercent'
import Options from './Options'

interface Props {
  onToggle?: () => void
}

const SymbolSelect: FC<Props> = ({ onToggle }) => {
  const ref = useRef(null)

  const { mobile } = useContext(MobileContext)

  const spotPrices = usePairsInfoStore((state) => state.spotPrices)
  const indicators = usePairsInfoStore((state) => state.indicators)
  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const updateQuoteToken = useQuoteTokenStore((state) => state.updateQuoteToken)

  const [show, setShow] = useState<boolean>(false)

  const changeFunc = (pair: Record<string, any>) => {
    setShow(false)

    updateQuoteToken(pair.symbol)
  }

  const toggleFunc = () => {
    setShow(false)
    onToggle?.()
  }

  useClickAway(ref, () => setShow(false))

  return (
    <div className={classNames('web-trade-symbol-select', { show })} ref={ref}>
      {mobile && <div className="web-trade-symbol-select-toggle" onClick={toggleFunc} />}
      <div className="web-trade-symbol-select-curr" onClick={() => setShow(!show)}>
        <h4>
          {quoteToken}
          {VALUATION_TOKEN_SYMBOL}
        </h4>
        <aside>
          <Skeleton rowsProps={{ rows: 1 }} animation loading={Number(spotPrices[marginToken][quoteToken]) === 0}>
            <BalanceShow value={keepDecimals(spotPrices[marginToken][quoteToken], 2)} />
          </Skeleton>
          <ChangePercent value={indicators[quoteToken]?.price_change_rate ?? 0} />
        </aside>
      </div>
      {show && <Options onChange={changeFunc} />}
    </div>
  )
}

export default SymbolSelect
