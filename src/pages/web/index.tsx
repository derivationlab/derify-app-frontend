import { useAccount } from 'wagmi'
import React, { FC, FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'

import { getIP } from '@/api'
import { Redirect, Switch, Route } from '@/components/common/Route'

import Header from '@/components/web/Header'
import Toast from '@/components/common/Toast'
import Loading from '@/components/common/Loading'
import Earn from '@/pages/web/Earn'
import Trade from '@/pages/web/Trade'
import Dashboard from '@/pages/web/Dashboard'
import Data from '@/pages/web/Data'
import BrokerRank from '@/pages/web/Broker/Rank'
import BrokerBind from '@/pages/web/Broker/Bind'
import BrokerBound from '@/pages/web/Broker/MyBroker'
import BrokerConnect from '@/pages/web/Broker/c/Connect'
import BrokerBindList from '@/pages/web/Broker/Bind/List'
import BrokerWorkbench from '@/pages/web/Broker/Workbench'
import BrokerSignUpStep1 from '@/pages/web/Broker/SignUp/step1'
import BrokerSignUpStep2 from '@/pages/web/Broker/SignUp/step2'
import BrokerSignUpStep3 from '@/pages/web/Broker/SignUp/step3'
import BrokerInfo from '@/pages/web/Broker/MyBroker/brokerInfo'
import AccessDeniedDialog from '@/components/common/Wallet/AccessDenied'
import { BrokerBindRoute, BWorkbenchRoute } from '@/pages/web/Route'
import { useMarginToken } from '@/zustand'

// todo 改造
const Web: FC = () => {
  const { data: account } = useAccount()
  const { broker, brokerLoaded, brokerBound, brokerBoundLoaded } = {
    broker: {},
    brokerLoaded: true,
    brokerBound: {},
    brokerBoundLoaded: true
  } as any

  const marginToken = useMarginToken((state) => state.marginToken)

  const [visible, setVisible] = useState<boolean>(false)

  const handleBroker = useMemo(() => {
    return <BrokerBound />
    if (brokerLoaded && brokerBoundLoaded) {
      return broker?.isBroker ? (
        <Redirect to="/broker-workbench" />
      ) : brokerBound?.broker ? (
        <BrokerBound />
      ) : (
        <Redirect to="/broker-bind" />
      )
    }
    return <Loading show type="fixed" />
  }, [broker?.isBroker, brokerBound?.broker, brokerLoaded, brokerBoundLoaded])

  const handleBrokerBind = useMemo(() => {
    return <BrokerBind />
    if (brokerBoundLoaded) {
      return brokerBound?.broker ? <Redirect to="/broker" /> : <BrokerBind />
    }
    return <Loading show type="fixed" />
  }, [brokerBoundLoaded, brokerBound?.broker])

  const handleUnbindBroker = useCallback(
    (C: FunctionComponent) => {
      // return <C />
      if (brokerBoundLoaded) {
        return brokerBound?.broker ? <C /> : <Redirect to="/broker-bind" />
      }
      if (!account?.address) {
        return <C />
      }
      return <Loading show type="fixed" />
    },
    [brokerBoundLoaded, brokerBound?.broker, account?.address]
  )

  const handleBrokerBindList = useMemo(() => {
    return <BrokerBindList />
    if (brokerBoundLoaded) {
      return brokerBound?.broker ? <Redirect to="/broker" /> : <BrokerBindList />
    }
    return <Loading show type="fixed" />
  }, [brokerBoundLoaded, brokerBound?.broker])

  const handleBrokerInfoEdit = useMemo(() => {
    return <BrokerSignUpStep2 />
    if (brokerLoaded) {
      if (broker?.isBroker) {
        return <BrokerSignUpStep2 />
      } else {
        return <Redirect to="/broker" />
      }
    }
    return <Loading show type="fixed" />
  }, [broker?.isBroker, brokerLoaded])

  const handleBrokerWorkbench = useMemo(() => {
    return <BrokerWorkbench />
    if (brokerLoaded && brokerBoundLoaded) {
      if (broker?.isBroker) {
        return <BrokerWorkbench />
        // if (broker.broker) return <BrokerWorkbench />
        // return <Redirect to="/broker/sign-up/step2" />
      } else {
        return brokerBound?.broker ? <Redirect to="/broker" /> : <Redirect to="/broker-bind" />
      }
    }
    return <Loading show type="fixed" />
  }, [broker?.isBroker, brokerBound?.broker, brokerLoaded, brokerBoundLoaded])

  const handleBrokerSignUpStep1 = useMemo(() => {
    return <BrokerSignUpStep1 />
    if (brokerLoaded) {
      if (!broker?.isBroker) return <BrokerSignUpStep1 />
      return <Redirect to="/broker" />
    }
    return <Loading show type="fixed" />
  }, [brokerLoaded, broker?.isBroker])

  const handleBrokerSignUpStep2 = useMemo(() => {
    return <BrokerSignUpStep2 />
    if (brokerLoaded) {
      if (broker?.isBroker && !broker?.broker) return <BrokerSignUpStep2 />

      return <Redirect to="/broker" />
    }
    return <Loading show type="fixed" />
  }, [brokerLoaded, broker?.isBroker, broker?.broker])

  useEffect(() => {
    const func = async () => {
      const data = await getIP()
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
            <BrokerBindRoute>
              <Earn />
            </BrokerBindRoute>
          )}
        />
        <Route
          path="/:id/data"
          exact
          render={() => (
            <BrokerBindRoute>
              <Data />
            </BrokerBindRoute>
          )}
        />
        <Route
          path="/:id/trade"
          exact
          render={() => (
            <BrokerBindRoute>
              <Trade />
            </BrokerBindRoute>
          )}
        />
        <Route
          path="/:id/dashboard"
          exact
          render={() => (
            <BrokerBindRoute>
              <Dashboard />
            </BrokerBindRoute>
          )}
        />

        {account?.address ? (
          <>
            <Route path="/broker" exact render={() => <BrokerBound />} />
            <Route path="/broker/bind" exact render={() => <BrokerBind />} />
            <Route path="/broker/list" exact render={() => <BrokerBindList />} />
            <Route path="/broker/edit" exact render={() => <BrokerSignUpStep2 />} />
            <Route path="/broker/sign-up/step1" render={() => <BrokerSignUpStep1 />} />
            <Route path="/broker/sign-up/step2" render={() => <BrokerSignUpStep2 />} />
            <Route path="/broker/sign-up/step3" render={() => <BrokerSignUpStep3 />} />
            <Route path="/:id/broker/rank" exact render={() => <BrokerRank />} />
            <Route
              path="/:id/broker/workbench"
              exact
              render={() => (
                <BWorkbenchRoute>
                  <BrokerWorkbench />
                </BWorkbenchRoute>
              )}
            />
            <Route path="/broker/profile/:id" exact render={() => <BrokerInfo />} />
          </>
        ) : (
          <BrokerConnect />
        )}

        <>
          {/*<Route path="/broker" exact render={() => handleBroker} />*/}
          {/*<Route path="/broker/:id" exact component={BrokerInfo} />*/}
          {/*<Route path="/broker/sign-up/step1" render={() => handleBrokerSignUpStep1} />*/}
          {/*<Route path="/broker/sign-up/step2" render={() => handleBrokerSignUpStep2} />*/}
          {/*<Route path="/broker/sign-up/step3" component={BrokerSignUpStep3} />*/}
          {/*<Route path="/broker-edit" render={() => handleBrokerInfoEdit} />*/}
          {/*<Route path="/broker-bind" exact render={() => handleBrokerBind} />*/}
          {/*<Route path="/broker-bind/list" render={() => handleBrokerBindList} />*/}
          {/*<Route path="/:id/broker-rank" exact component={BrokerRank} />*/}
          {/*<Route path="/broker-workbench" render={() => handleBrokerWorkbench} />*/}
          {/*<Route path="/:id/broker-workbench" render={() => handleBrokerWorkbench} />*/}
        </>

        <Route path="*" render={() => <Redirect to={`/${marginToken}/trade`} />} />
      </Switch>
      <Toast />
      <AccessDeniedDialog visible={visible} />
    </>
  )
}

export default Web
