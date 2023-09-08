import classNames from 'classnames'
import { useAccount } from 'wagmi'

import React, { FC, useState } from 'react'
import { isMobile } from 'react-device-detect'

import Bench from './Bench'
import Data from './Data'
import KLine from './KLine'
import Chart from './KLine/Chart'
import HeaderData from './KLine/HeaderData'
import MobileFixed from './KLine/MobileFixed'
import SymbolSelect from './KLine/SymbolSelect'
import useTradingUpdate from '@/hooks/useTradingUpdate'

const Trade: FC = () => {
  useTradingUpdate()
  
  const { address } = useAccount()
  const [toggle, setToggle] = useState<boolean>(false)

  if (isMobile) {
    return (
      <>
        <div className="web-trade">
          <div className="web-trade-mobile-header">
            <SymbolSelect />
            <div className={classNames({ none: toggle })}>
              <Chart />
            </div>
            <div className={classNames({ none: !toggle })}>
              <Bench />
            </div>
            <HeaderData />
          </div>
          <Data />
        </div>
        <MobileFixed address={address} isKline={!toggle} goBench={() => setToggle(true)} />
      </>
    )
  }

  return (
    <div className="web-trade">
      <main className="web-trade-main">
        <KLine />
        <Data />
      </main>
      <Bench />
    </div>
  )
}

export default Trade
