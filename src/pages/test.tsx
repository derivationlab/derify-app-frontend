import React, { FC, useEffect } from 'react'
// import Connect from '@/components/common/Connect'
import {
  bindYourBroker,
  getBrokerInfoByAddr,
  getBrokerInfoById,
  getBrokerInfoByTrader,
  getBrokerRewardsToday,
  getBrokerAccountFlow,
  getBrokersList,
  updateBrokerInfo,
  getListOfAllUsersOfBroker
} from '@/api'
import { useAccount, useSigner } from 'wagmi'
// import { getBDRFContract, getDerifyExchangeContract, getEDRFContract } from '@/utils/contractHelpers'
// import { getDecimalAmount, safeInterceptionValues } from '@/utils/practicalMethod'
import BigNumber from 'bignumber.js'
import { getEventsData } from '@/api/events'
import { getMyPositionsData } from '@/store/contract/helper'

import Loading from '@/components/common/Loading'

const Test: FC = () => {
  const { data: signer } = useSigner()
  const { data: account } = useAccount()
  useEffect(() => {
    const fn = async (account: string) => {
      try {
        /**
         * longPmrRate: "0"
         price_change_rate: "0.034801029230928066"
         shortPmrRate: "0"
         token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
         */
        // getEventsData((data) => {
        //   console.info(data)
        // })
        // console.info(account)
        const traders = await getMyPositionsData(account)
        // const accountData = await c.getTraderAccount(account);
        // const tradeVariables = await c.getTraderVariables('0x6F67DC6F72e5507AF6d3f669FcA6C4281c511257');
        // console.info(tradeVariables)
        // console.info(safeInterceptionValues(tradeVariables[0], 8, 8))
        // console.info(safeInterceptionValues(tradeVariables[1], 8))
        // console.info(safeInterceptionValues(tradeVariables[2], 8))
      } catch (e) {
        console.info(e)
      }
      // console.info(tradeVariables)
      // const r2 = await c.burn(account, ("0x" + (new BigNumber(1.1)).toString(16)))
      // console.info(getDecimalAmount(1).toString())
      // console.info(("0x" + (new BigNumber(100)).toString(16)))
      // const r = await getBrokerInfoByTrader(account)
      // const r1 = await getBrokersList(0, 10)
      // const r = await getBrokerInfoById('Crespikss')
      // const r = await getBrokerInfoByAddr(account)
      // const r = await getBrokerRewardsToday('0xA0F53B952005A57260B19143708Bcd34eB6F78b6')
      // const r = await getListOfAllUsersOfBroker('0xA0F53B952005A57260B19143708Bcd34eB6F78b6', 0, 10)
      // const r = await bindYourBroker({
      //   brokerId: "Crespikss",
      //   trader: account
      // })
      // const r = await updateBrokerInfo({
      //   id: "test003",
      //   logo: "",
      //   name: "test003",
      //   introduction: "test003",
      //   broker: account
      // })
      // console.info(r1)
      // console.info(r)
    }
    if (account?.address && signer) void fn(account?.address)
  }, [account?.address, signer])

  const toastTest = () => {
    window.toast.success('12345')
    window.toast.loading('12345')
    window.toast.error('12345')
  }
  return (
    <div className="web">
      <button onClick={toastTest}>toastTest</button>
      {/*<Loading show={false} type="fixed" />*/}
      {/*<Loading show={true} type="float" />*/}
    </div>
  )
}

export default Test
