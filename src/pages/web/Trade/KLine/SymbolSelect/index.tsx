import React, { FC, useState, useRef, useContext } from 'react'
import classNames from 'classnames'
import { useClickAway } from 'react-use'

import { useSpotPrice } from '@/hooks/useMatchConf'
import { MobileContext } from '@/context/Mobile'
import { useMarginToken, usePairsInfo, useQuoteToken } from '@/zustand'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import ChangePercent from '@/components/common/ChangePercent'

import Options from './Options'

interface Props {
  onToggle?: () => void
}

const SymbolSelect: FC<Props> = ({ onToggle }) => {
  const ref = useRef(null)
  const { mobile } = useContext(MobileContext)

  const indicators = usePairsInfo((state) => state.indicators)
  const updateQuoteToken = useQuoteToken((state) => state.updateQuoteToken)
  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)

  const { spotPrice } = useSpotPrice(quoteToken, marginToken)

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
        <h4>{quoteToken}USD</h4>
        <aside>
          <BalanceShow value={spotPrice} unit="" />
          <ChangePercent value={indicators?.price_change_rate ?? 0} />
        </aside>
      </div>
      {show && <Options onChange={changeFunc} />}
    </div>
  )
}

export default SymbolSelect
