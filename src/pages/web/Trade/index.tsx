import classNames from 'classnames'
import { useAccount } from 'wagmi'
import React, { FC, useState, useContext } from 'react'

import { MobileContext } from '@/context/Mobile'

import TradingUpdater from '@/pages/updater/TradingUpdater'
import IndicatorsUpdater from '@/pages/updater/IndicatorsUpdater'

import Data from './Data'
import KLine from './KLine'
import Bench from './Bench'
import Chart from './KLine/Chart'
import HeaderData from './KLine/HeaderData'
import MobileFixed from './KLine/MobileFixed'
import SymbolSelect from './KLine/SymbolSelect'

const Trade: FC = () => {
  const [toggle, setToggle] = useState<boolean>(false)

  const { address } = useAccount()
  const { mobile } = useContext(MobileContext)

  if (mobile) {
    return (
      <>
        <div className="web-trade">
          <TradingUpdater />
          <IndicatorsUpdater />

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
        <MobileFixed address={address} isKline={!toggle} goBench={() => setToggle(true)} />
      </>
    )
  }

  return (
    <div className="web-trade">
      <TradingUpdater />
      <IndicatorsUpdater />

      <main className="web-trade-main">
        <KLine />
        <Data />
      </main>
      <Bench />
    </div>
  )
}

export default Trade
