import React, { FC, useState, useRef, useMemo, useContext, useEffect } from 'react'
import classNames from 'classnames'
import { useClickAway } from 'react-use'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import ChangePercent from '@/components/common/ChangePercent'
import { MobileContext } from '@/context/Mobile'

import Options from './Options'
import { useContractData } from '@/store/contract/hooks'
import { useAppDispatch } from '@/store'
import { setCurrentPair } from '@/store/contract'
import Cache from '@/utils/cache'

interface Props {
  onToggle?: () => void
}

const SymbolSelect: FC<Props> = ({ onToggle }) => {
  const dispatch = useAppDispatch()
  const { pairs } = useContractData()
  const { mobile } = useContext(MobileContext)

  const ref = useRef(null)
  const [show, setShow] = useState<boolean>(false)

  useClickAway(ref, () => setShow(false))

  const [currentPairInfo, setCurrentPairInfo] = useState<Record<string, any>>({})

  const changeFunc = (pair: Record<string, any>) => {
    setCurrentPairInfo(pair)

    dispatch(setCurrentPair(pair.token))

    setShow(false)

    Cache.set('currentPair', pair.token)
  }

  const toggleFunc = () => {
    setShow(false)
    onToggle?.()
  }

  useEffect(() => {
    if (pairs.length) {
      const currentPair = Cache.get('currentPair')
      const find = pairs.find((p) => p.token === currentPair) ?? pairs.find((p) => p.symbol === 'BTC')
      if (find) setCurrentPairInfo(find)
    }
  }, [pairs])

  return (
    <div className={classNames('web-trade-symbol-select', { show })} ref={ref}>
      {mobile && <div className="web-trade-symbol-select-toggle" onClick={toggleFunc} />}
      <div className="web-trade-symbol-select-curr" onClick={() => setShow(!show)}>
        <h4>{currentPairInfo.name}</h4>
        <aside>
          <BalanceShow value={currentPairInfo?.spotPrice ?? 0} unit="" />
          <ChangePercent value={currentPairInfo?.price_change_rate ?? 0} />
        </aside>
      </div>
      {show && <Options data={pairs} onChange={changeFunc} />}
    </div>
  )
}

export default SymbolSelect
