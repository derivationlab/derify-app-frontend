import React, { FC, useEffect, useState, useContext } from 'react'
import { useAccount, useBlockNumber } from 'wagmi'
import { useInterval } from 'react-use'
import classNames from 'classnames'

import { claimTestUSDT } from '@/api'
import { useAppDispatch } from '@/store'
import { getBrokerBoundDataAsync, getBrokerDataAsync } from '@/store/trader'
import { getEventsDataAsync, getMyPositionsDataAsync, getTokenSpotPriceAsync } from '@/store/contract'
import { getCurrentPositionsAmountDataAsync, getPositionChangeFeeRatioDataAsync } from '@/store/constant'
import { MobileContext } from '@/context/Mobile'

// import Button from '@/components/common/Button'

import KLine from './KLine'
import Bench from './Bench'
import Data from './Data'

import SymbolSelect from './KLine/SymbolSelect'
import HeaderData from './KLine/HeaderData'
import Chart from './KLine/Chart'
import MobileFixed from './KLine/MobileFixed'

const Trade: FC = () => {
  const dispatch = useAppDispatch()
  const { data: account } = useAccount()
  const { data: blockNumber } = useBlockNumber()
  const { mobile } = useContext(MobileContext)
  const [toggle, setToggle] = useState<boolean>(false)

  // 404
  const claimTestUSDTEv = async () => {
    const data = await claimTestUSDT({ trader: account?.address, amount: 100000 })
    // console.info(data)
  }

  useEffect(() => {
    if (account?.address) dispatch(getMyPositionsDataAsync(account.address))
  }, [account?.address])

  useEffect(() => {
    if (blockNumber) {
      dispatch(getTokenSpotPriceAsync())
      dispatch(getEventsDataAsync())
      dispatch(getCurrentPositionsAmountDataAsync())
      dispatch(getPositionChangeFeeRatioDataAsync())
    }
  }, [blockNumber])

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
        <MobileFixed address={account?.address} isKline={!toggle} goBench={() => setToggle(true)} />
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
