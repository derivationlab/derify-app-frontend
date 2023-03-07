import classNames from 'classnames'
import { useAccount } from 'wagmi'
import React, { FC, useState, useContext } from 'react'

import { MobileContext } from '@/context/Mobile'

import TradingUpdater from '@/pages/Updater/TradingUpdater'
import UpdateIndicators from '@/pages/Updater/UpdateIndicators'

import Data from './Data'
import KLine from './KLine'
import Bench from './Bench'
import Chart from './KLine/Chart'
import HeaderData from './KLine/HeaderData'
import MobileFixed from './KLine/MobileFixed'
import SymbolSelect from './KLine/SymbolSelect'

const Trade: FC = () => {
  const [toggle, setToggle] = useState<boolean>(false)

  const { data } = useAccount()
  const { mobile } = useContext(MobileContext)

  if (mobile) {
    return (
      <>
        <div className="web-trade">
          <TradingUpdater />
          <UpdateIndicators />

          <div className="web-trade-mobile-header">
            <SymbolSelect onToggle={() => setToggle(!toggle)} />
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
        <MobileFixed address={data?.address} isKline={!toggle} goBench={() => setToggle(true)} />
      </>
    )
  }

  return (
    <div className="web-trade">
      <TradingUpdater />
      <UpdateIndicators />

      <main className="web-trade-main">
        <KLine />
        <Data />
      </main>
      <Bench />
    </div>
  )
}

export default Trade
