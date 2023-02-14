import React, { FC, useState, useContext } from 'react'
import { useAccount } from 'wagmi'
import classNames from 'classnames'

import { MobileContext } from '@/context/Mobile'

import Data from './Data'
import KLine from './KLine'
import Bench from './Bench'
import Chart from './KLine/Chart'
import HeaderData from './KLine/HeaderData'
import MobileFixed from './KLine/MobileFixed'
import SymbolSelect from './KLine/SymbolSelect'
import Updater from '@/pages/web/Trade/Updater'

const Trade: FC = () => {
  const { data } = useAccount()

  const { mobile } = useContext(MobileContext)

  const [toggle, setToggle] = useState<boolean>(false)

  if (mobile) {
    return (
      <>
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
        <MobileFixed address={data?.address} isKline={!toggle} goBench={() => setToggle(true)} />
      </>
    )
  }

  return (
    <div className="web-trade">
      <Updater />
      <main className="web-trade-main">
        <KLine />
        <Data />
      </main>
      <Bench />
    </div>
  )
}

export default Trade
