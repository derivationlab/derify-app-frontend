import React, { FC, useState, useRef, useMemo, useContext } from 'react'
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
  const { pairs, currentPair } = useContractData()
  const { mobile } = useContext(MobileContext)

  const ref = useRef(null)
  const [show, setShow] = useState<boolean>(false)

  useClickAway(ref, () => setShow(false))

  const [curr, setCurr] = useState<Record<string, any>>(pairs[Cache.get('currentPairIndex') ?? 0])

  const changeFunc = (pair: Record<string, any>, pairIndex: number) => {
    setCurr(pair)
    // onChange(item)
    setShow(false)

    dispatch(setCurrentPair(pair.token))

    Cache.set('currentPairIndex', pairIndex)
  }

  const memoPairInfo = useMemo(() => {
    if (pairs.length) {
      const find = pairs.find((p) => p.token === curr.token)
      return find
    }
  }, [curr, pairs])

  const toggleFunc = () => {
    setShow(false)
    onToggle?.()
  }

  return (
    <div className={classNames('web-trade-symlol-select', { show })} ref={ref}>
      {mobile && <div className="web-trade-symlol-select-toggle" onClick={toggleFunc} />}
      <div className="web-trade-symlol-select-curr" onClick={() => setShow(!show)}>
        <h4>{curr.name}</h4>
        <aside>
          <BalanceShow value={memoPairInfo?.spotPrice ?? 0} unit="" />
          <ChangePercent value={memoPairInfo?.price_change_rate ?? 0} />
        </aside>
      </div>
      {show && <Options curr={curr} data={pairs} onChange={changeFunc} />}
    </div>
  )
}

export default SymbolSelect
