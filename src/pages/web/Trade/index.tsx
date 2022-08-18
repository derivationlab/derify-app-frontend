import React, { FC, useEffect, useState, useContext } from 'react'
import { useAccount } from 'wagmi'
import classNames from 'classnames'
import { useInterval } from 'react-use'

import { useAppDispatch } from '@/store'
import { MobileContext } from '@/context/Mobile'
import { getEventsDataAsync, getMyPositionsDataAsync, getTokenSpotPriceAsync } from '@/store/contract'
import { getCurrentPositionsAmountDataAsync, getPositionChangeFeeRatioDataAsync } from '@/store/constant'

import Data from './Data'
import KLine from './KLine'
import Bench from './Bench'
import Chart from './KLine/Chart'
import HeaderData from './KLine/HeaderData'
import MobileFixed from './KLine/MobileFixed'
import SymbolSelect from './KLine/SymbolSelect'

const Trade: FC = () => {
  const dispatch = useAppDispatch()
  const { data: account } = useAccount()
  const { mobile } = useContext(MobileContext)

  const [toggle, setToggle] = useState<boolean>(false)

  useEffect(() => {
    if (account?.address) dispatch(getMyPositionsDataAsync(account.address))
  }, [account?.address])

  useInterval(() => {
    dispatch(getTokenSpotPriceAsync())
    dispatch(getEventsDataAsync())
    dispatch(getCurrentPositionsAmountDataAsync())
    dispatch(getPositionChangeFeeRatioDataAsync())
  }, 6000)

  if (mobile) {
    return (
      <>
        <div className='web-trade'>
          <div className='web-trade-mobile-header'>
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
    <div className='web-trade'>
      <main className='web-trade-main'>
        <KLine />
        <Data />
      </main>
      <Bench />
    </div>
  )
}

export default Trade
