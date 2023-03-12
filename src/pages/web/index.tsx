import React, { FC, useEffect, useState } from 'react'

import { getIpLocation } from '@/api'
import { useMTokenForRoute } from '@/hooks/useTrading'
import { R0, R1, R2, R3 } from '@/pages/web/Route'
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

const Web: FC = () => {
  const { marginToken } = useMTokenForRoute()

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
            <R0 pathKey="earn">
              <Earn />
            </R0>
          )}
        />
        <Route
          path="/:id/mining/rank"
          exact
          render={() => (
            <R0 pathKey="mining/rank">
              <MiningRank />
            </R0>
          )}
        />
        <Route
          path="/:id/data"
          exact
          render={() => (
            <R0 pathKey="data">
              <Data />
            </R0>
          )}
        />
        <Route
          path="/:id/trade"
          exact
          render={() => (
            <R0 pathKey="trade">
              <Trade />
            </R0>
          )}
        />
        <Route
          path="/broker"
          exact
          render={() => (
            <R1>
              <BrokerBound />
            </R1>
          )}
        />
        <Route
          path="/broker/bind"
          exact
          render={() => (
            <R2>
              <BrokerBind />
            </R2>
          )}
        />
        <Route
          path="/broker/list"
          exact
          render={() => (
            <R2>
              <BrokerBindList />
            </R2>
          )}
        />
        <Route
          path="/broker/edit"
          exact
          render={() => (
            <R3>
              <BrokerSignUpStep2 />
            </R3>
          )}
        />
        <Route
          path="/broker/sign-up/step1"
          exact
          render={() => (
            <R3>
              <BrokerSignUpStep1 />
            </R3>
          )}
        />
        <Route
          path="/broker/sign-up/step2"
          exact
          render={() => (
            <R3>
              <BrokerSignUpStep2 />
            </R3>
          )}
        />
        <Route path="/broker/sign-up/step3" exact render={() => <BrokerSignUpStep3 />} />
        <Route path="/:id/broker/rank" exact render={() => <BrokerRank />} />
        <Route
          path="/:id/broker/workbench"
          exact
          render={() => (
            <R3 pathKey="broker/workbench">
              <BrokerWorkbench />
            </R3>
          )}
        />
        <Route path="/broker/profile/:id" exact render={() => <BrokerInfo />} />
        <Route path="/dashboard" render={() => <Dashboard />} />
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
