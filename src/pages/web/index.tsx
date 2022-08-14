import { useAccount } from 'wagmi'
import React, { FC, FunctionComponent, useCallback, useEffect, useMemo } from 'react'

import { useAppDispatch } from '@/store'
import { useTraderData } from '@/store/trader/hooks'
import { getEventsDataAsync } from '@/store/contract'
import { Redirect, Switch, Route } from '@/components/common/Route'
import { getBrokerBoundDataAsync, getBrokerDataAsync, getTraderDataAsync } from '@/store/trader'

import Header from '@/components/web/Header'
import Loading from '@/components/common/Loading'
import Toast from '@/components/common/Toast'

import Earn from '@/pages/web/Earn'
import Trade from '@/pages/web/Trade'
import Faucet from '@/pages/web/Faucet'
import Airdrop from '@/pages/web/Airdrop'
import Dashboard from '@/pages/web/Dashboard'
import BrokerRank from '@/pages/web/Broker/Rank'
import BrokerBind from '@/pages/web/Broker/Bind'
import BrokerInfo from '@/pages/web/Broker/MyBroker/brokerInfo'
import BrokerBound from '@/pages/web/Broker/MyBroker'
import BrokerBindList from '@/pages/web/Broker/Bind/List'
import BrokerWorkbench from '@/pages/web/Broker/Workbench'
import BrokerSignUpStep1 from '@/pages/web/Broker/SignUp/step1'
import BrokerSignUpStep2 from '@/pages/web/Broker/SignUp/step2'
import BrokerSignUpStep3 from '@/pages/web/Broker/SignUp/step3'
import BrokerConnect from '@/pages/web/Broker/c/Connect'

const Web: FC = () => {
  const dispatch = useAppDispatch()
  const { data: account } = useAccount()
  const { broker, brokerLoaded, brokerBound, brokerBoundLoaded } = useTraderData()

  const handleBroker = useMemo(() => {
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
    if (brokerBoundLoaded) {
      return brokerBound?.broker ? <Redirect to="/broker" /> : <BrokerBind />
    }
    return <Loading show type="fixed" />
  }, [brokerBoundLoaded, brokerBound?.broker])

  const handleUnbindBroker = useCallback(
    (C: FunctionComponent) => {
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
    if (brokerBoundLoaded) {
      return brokerBound?.broker ? <Redirect to="/broker" /> : <BrokerBindList />
    }
    return <Loading show type="fixed" />
  }, [brokerBoundLoaded, brokerBound?.broker])

  const handleBrokerInfoEdit = useMemo(() => {
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
  }, [broker?.isBroker, broker?.broker, brokerBound?.broker, brokerLoaded, brokerBoundLoaded])

  const handleBrokerSignUpStep1 = useMemo(() => {
    if (brokerLoaded) {
      if (!broker?.isBroker) return <BrokerSignUpStep1 />
      return <Redirect to="/broker" />
    }
    return <Loading show type="fixed" />
  }, [brokerLoaded, broker?.isBroker])

  const handleBrokerSignUpStep2 = useMemo(() => {
    if (brokerLoaded) {
      if (broker?.isBroker && !broker?.broker) return <BrokerSignUpStep2 />

      return <Redirect to="/broker" />
    }
    return <Loading show type="fixed" />
  }, [brokerLoaded, broker?.isBroker, broker?.broker])

  useEffect(() => {
    if (account?.address) {
      dispatch(getTraderDataAsync(account?.address))
      dispatch(getBrokerDataAsync(account?.address))
      dispatch(getBrokerBoundDataAsync(account?.address))
    }
  }, [account?.address, dispatch])

  useEffect(() => {
    dispatch(getEventsDataAsync())
  }, [dispatch])

  return (
    <>
      <Header />
      <Switch>
        <Route path="/" exact render={() => <Redirect to="/trade" />} />
        <Route path="/earn" render={() => handleUnbindBroker(Earn)} />
        <Route path="/trade" render={() => handleUnbindBroker(Trade)} />
        <Route path="/faucet" render={() => handleUnbindBroker(Faucet)} />
        <Route path="/airdrop" render={() => handleUnbindBroker(Airdrop)} />
        <Route path="/dashboard" render={() => handleUnbindBroker(Dashboard)} />

        {!account?.address ? (
          <BrokerConnect />
        ) : (
          <>
            <Route path="/broker" exact render={() => handleBroker} />
            <Route path="/broker/:id" exact component={BrokerInfo} />
            <Route path="/broker/sign-up/step1" render={() => handleBrokerSignUpStep1} />
            <Route path="/broker/sign-up/step2" render={() => handleBrokerSignUpStep2} />
            <Route path="/broker/sign-up/step3" component={BrokerSignUpStep3} />
            <Route path="/broker-edit" render={() => handleBrokerInfoEdit} />
            <Route path="/broker-bind" exact render={() => handleBrokerBind} />
            <Route path="/broker-bind/list" render={() => handleBrokerBindList} />
            <Route path="/broker-rank" component={BrokerRank} />
            <Route path="/broker-workbench" render={() => handleBrokerWorkbench} />
          </>
        )}

        <Route path="*" render={() => <Redirect to="/trade" />} />
      </Switch>
      <Toast />
    </>
  )
}

export default Web
