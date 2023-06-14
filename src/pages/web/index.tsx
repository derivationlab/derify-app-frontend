import React, { FC } from 'react'

import { Redirect, Switch, Route } from '@/components/common/Route'
import Toast from '@/components/common/Toast'
import AccessDeniedDialog from '@/components/common/Wallet/AccessDenied'
import Header from '@/components/web/Header'
import { useCheckMarginToken } from '@/hooks/useCheckMarginToken'
import { useRegionalJudgment } from '@/hooks/useRegionalJudgment'
import BrokerBind from '@/pages/web/Broker/Bind'
import BrokerBindList from '@/pages/web/Broker/Bind/List'
import BrokerBound from '@/pages/web/Broker/MyBroker'
import BrokerInfo from '@/pages/web/Broker/MyBroker/brokerInfo'
import BrokerRank from '@/pages/web/Broker/Rank'
import BrokerSignUpStep1 from '@/pages/web/Broker/SignUp/step1'
import BrokerSignUpStep2 from '@/pages/web/Broker/SignUp/step2'
import BrokerSignUpStep3 from '@/pages/web/Broker/SignUp/step3'
import BrokerWorkbench from '@/pages/web/Broker/Workbench'
import CompetitionRank from '@/pages/web/Competition'
import BuybackPlan from '@/pages/web/Dashboard/BuybackPlan'
import GrantList from '@/pages/web/Dashboard/GrantList'
import Overview from '@/pages/web/Dashboard/Overview'
import Data from '@/pages/web/Data'
import Earn from '@/pages/web/Earn'
import Faucet from '@/pages/web/Faucet'
import MiningRank from '@/pages/web/Mining'
import MySpace from '@/pages/web/MySpace'
import System from '@/pages/web/MySpace/System'
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
  RBrokerSignUpStep2,
  routingWithMarginInfo
} from '@/pages/web/Route'
import Trade from '@/pages/web/Trade'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'

const Web: FC = () => {
  useCheckMarginToken()
  const { warning } = useRegionalJudgment()
  const { symbol } = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  return (
    <>
      <Header />
      <Switch>
        <Route path="/" exact render={() => <Redirect to={`/${symbol}/trade`} />} />
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
          path="/:id/competition/rank"
          exact
          render={() => (
            <RWithMarToken pathKey="competition/rank">
              <CompetitionRank />
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
        <Route path={`/${symbol}/system/parameters`} render={() => <System />} />
        <Route path="*" render={() => <Redirect to={`/${symbol}/trade`} />} />
      </Switch>
      <Toast />
      <AccessDeniedDialog visible={warning} />
    </>
  )
}

export default Web
