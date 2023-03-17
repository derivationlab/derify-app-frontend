import React, { FC, useEffect, useState } from 'react'

import { getIpLocation } from '@/api'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import {
  RWithMarToken,
  RBrokerWorkbench,
  RBrokerToBind,
  RBrokerList,
  RBrokerBound,
  RBrokerSignUpStep3,
  RBrokerSignUpStep1_2,
  RBrokerProfile,
  RConnectWallet
} from '@/pages/web/Route'
import { Redirect, Switch, Route } from '@/components/common/Route'

import Header from '@/components/web/Header'
import Toast from '@/components/common/Toast'
import Earn from '@/pages/web/Earn'
import Trade from '@/pages/web/Trade'
import Dashboard from '@/pages/web/Dashboard'
import Data from '@/pages/web/Data'
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
  const { marginToken } = useMTokenFromRoute()

  const [visible, setVisible] = useState<boolean>(false)

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
            <RBrokerSignUpStep1_2>
              <BrokerSignUpStep1 />
            </RBrokerSignUpStep1_2>
          )}
        />
        <Route
          path="/broker/sign-up/step2"
          exact
          render={() => (
            <RBrokerSignUpStep1_2>
              <BrokerSignUpStep2 />
            </RBrokerSignUpStep1_2>
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
        <Route path={`/${marginToken}/dashboard/overview`} component={Overview} />
        <Route path="/dashboard/buyback-plan" component={BuybackPlan} />
        <Route
          path="/dashboard/grant-list"
          render={() => (
            <RConnectWallet>
              <GrantList />
            </RConnectWallet>
          )}
        />
        <Route path="/my-space" render={() => <MySpace />} />
        <Route path="/system" render={() => <System />} />
        <Route path="*" render={() => <Redirect to={`/${marginToken}/trade`} />} />
      </Switch>
      <Toast />
      <AccessDeniedDialog visible={visible} />
    </>
  )
}

export default Web
