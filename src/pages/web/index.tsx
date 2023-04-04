import { useLocation } from 'react-router-dom'
import React, { FC, useEffect, useState } from 'react'

import { getIpLocation } from '@/api'
import { useMarginToken } from '@/store'
import { findMarginToken } from '@/config/tokens'
import { MarginTokenKeys } from '@/typings'
import { Redirect, Switch, Route } from '@/components/common/Route'
import {
  RBrokerList,
  RBrokerBound,
  RWithMarToken,
  RBrokerToBind,
  RBrokerProfile,
  RConnectWallet,
  RBrokerWorkbench,
  RBrokerSignUpStep3,
  RBrokerSignUpStep1,
  RBrokerSignUpStep2
} from '@/pages/web/Route'

import Header from '@/components/web/Header'
import Toast from '@/components/common/Toast'
import Earn from '@/pages/web/Earn'
import Trade from '@/pages/web/Trade'
import Data from '@/pages/web/Data'
import Faucet from '@/pages/web/Faucet'
import BrokerRank from '@/pages/web/Broker/Rank'
import BrokerBind from '@/pages/web/Broker/Bind'
import BrokerBound from '@/pages/web/Broker/MyBroker'
import BrokerBindList from '@/pages/web/Broker/Bind/List'
import BrokerWorkbench from '@/pages/web/Broker/Workbench'
import BrokerSignUpStep1 from '@/pages/web/Broker/SignUp/step1'
import BrokerSignUpStep2 from '@/pages/web/Broker/SignUp/step2'
import BrokerSignUpStep3 from '@/pages/web/Broker/SignUp/step3'
import BrokerInfo from '@/pages/web/Broker/MyBroker/brokerInfo'
import MiningRank from '@/pages/web/MiningRank'
import AccessDeniedDialog from '@/components/common/Wallet/AccessDenied'
import MySpace from '@/pages/web/MySpace'
import System from '@/pages/web/MySpace/System'
import Overview from '@/pages/web/Dashboard/Overview'
import GrantList from '@/pages/web/Dashboard/GrantList'
import BuybackPlan from '@/pages/web/Dashboard/BuybackPlan'

const Web: FC = () => {
  const { pathname } = useLocation()

  const [visible, setVisible] = useState<boolean>(false)

  const marginToken = useMarginToken((state) => state.marginToken)
  const updateMarginToken = useMarginToken((state) => state.updateMarginToken)

  useEffect(() => {
    const path = pathname.split('/')
    const find = findMarginToken(path[1])
    const margin = find ? find.symbol : marginToken
    // console.info(margin)
    updateMarginToken(margin as MarginTokenKeys)
  }, [pathname, marginToken])

  useEffect(() => {
    const func = async () => {
      const data = await getIpLocation()
      setVisible(!data)
    }

    void func()
  }, [])

  return (
    <>
      <Header />
      <Switch>
        <Route path="/" exact render={() => <Redirect to={`/${marginToken}/trade`} />} />
        <Route
          path="/:id/earn"
          exact
          render={() => (
            <RWithMarToken pathKey="earn">
              <Earn />
            </RWithMarToken>
          )}
        />
        <Route
          path="/:id/mining/rank"
          exact
          render={() => (
            <RWithMarToken pathKey="mining/rank">
              <MiningRank />
            </RWithMarToken>
          )}
        />
        <Route
          path="/:id/data"
          exact
          render={() => (
            <RWithMarToken pathKey="data">
              <Data />
            </RWithMarToken>
          )}
        />
        <Route
          path="/:id/trade"
          exact
          render={() => (
            <RWithMarToken pathKey="trade">
              <Trade />
            </RWithMarToken>
          )}
        />
        <Route
          path="/broker"
          exact
          render={() => (
            <RBrokerBound>
              <BrokerBound />
            </RBrokerBound>
          )}
        />
        <Route
          path="/broker/bind"
          exact
          render={() => (
            <RBrokerToBind>
              <BrokerBind />
            </RBrokerToBind>
          )}
        />
        <Route
          path="/broker/list"
          exact
          render={() => (
            <RBrokerList>
              <BrokerBindList />
            </RBrokerList>
          )}
        />
        <Route
          path="/broker/edit"
          exact
          render={() => (
            <RBrokerWorkbench>
              <BrokerSignUpStep2 />
            </RBrokerWorkbench>
          )}
        />
        <Route
          path="/broker/sign-up/step1"
          exact
          render={() => (
            <RBrokerSignUpStep1>
              <BrokerSignUpStep1 />
            </RBrokerSignUpStep1>
          )}
        />
        <Route
          path="/broker/sign-up/step2"
          exact
          render={() => (
            <RBrokerSignUpStep2>
              <BrokerSignUpStep2 />
            </RBrokerSignUpStep2>
          )}
        />
        <Route
          path="/broker/sign-up/step3"
          exact
          render={() => (
            <RBrokerSignUpStep3>
              <BrokerSignUpStep3 />
            </RBrokerSignUpStep3>
          )}
        />
        <Route path="/:id/broker/rank" exact render={() => <BrokerRank />} />
        <Route
          path="/:id/broker/workbench"
          exact
          render={() => (
            <RBrokerWorkbench pathKey="broker/workbench">
              <BrokerWorkbench />
            </RBrokerWorkbench>
          )}
        />
        <Route
          path="/broker/profile/:id"
          exact
          render={() => (
            <RBrokerProfile>
              <BrokerInfo />
            </RBrokerProfile>
          )}
        />
        <Route path="/dashboard/overview" component={Overview} />
        <Route path="/dashboard/buyback" component={BuybackPlan} />
        <Route
          path="/dashboard/grant"
          render={() => (
            <RConnectWallet>
              <GrantList />
            </RConnectWallet>
          )}
        />
        <Route path="/faucet" render={() => <Faucet />} />
        <Route path="/space" render={() => <MySpace />} />
        <Route path={`/${marginToken}/system`} render={() => <System />} />
        <Route path="*" render={() => <Redirect to={`/${marginToken}/trade`} />} />
      </Switch>
      <Toast />
      <AccessDeniedDialog visible={visible} />
    </>
  )
}

export default Web
