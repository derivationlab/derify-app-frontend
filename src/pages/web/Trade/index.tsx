import classNames from 'classnames'
import { useAccount } from 'wagmi'
import React, { FC, useState, useContext } from 'react'
import { MobileContext } from '@/providers/Mobile'
import TradingParamsUpdater from '@/pages/updater/TradingParamsUpdater'
import Data from './Data'
import KLine from './KLine'
import Bench from './Bench'
import Chart from './KLine/Chart'
import HeaderData from './KLine/HeaderData'
import MobileFixed from './KLine/MobileFixed'
import SymbolSelect from './KLine/SymbolSelect'

const Trade: FC = () => {
  const { mobile } = useContext(MobileContext)
  const { address } = useAccount()
  const [toggle, setToggle] = useState<boolean>(false)

  if (mobile) {
    return (
      <>
        <TradingParamsUpdater />
        <div className="web-trade">
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
      <TradingParamsUpdater />
      <main className="web-trade-main">
        <KLine />
        <Data />
      </main>
      <Bench />
    </div>
  )
}

export default Trade
