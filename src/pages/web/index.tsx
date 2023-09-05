import React, { FC, lazy } from 'react'
import { Redirect, Switch, Route } from 'react-router-dom'

import Toast from '@/components/common/Toast'
import AccessDeniedDialog from '@/components/common/Wallet/AccessDenied'
import Header from '@/components/web/Header'
import { R2, R4, R5, R8, R6, R7, R1, R3 } from '@/components/web/Route'
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
import Trade from '@/pages/web/Trade'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'

const UserApply = lazy(() => import('@/pages/web/userApply'))
const Consultant = lazy(() => import('@/pages/web/consultant'))

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
            <R1 pathKey="earn">
              <Earn />
            </R1>
          )}
        />
        <Route
          path="/:id/mining/rank"
          exact
          render={() => (
            <R1 pathKey="mining/rank">
              <MiningRank />
            </R1>
          )}
        />
        <Route
          path="/:id/competition/rank"
          exact
          render={() => (
            <R1 pathKey="competition/rank">
              <CompetitionRank />
            </R1>
          )}
        />
        <Route
          path="/:id/data"
          exact
          render={() => (
            <R1 pathKey="data">
              <Data />
            </R1>
          )}
        />
        <Route
          path="/:id/trade"
          exact
          render={() => (
            <R1 pathKey="trade">
              <Trade />
            </R1>
          )}
        />
        <Route
          path="/broker"
          exact
          render={() => (
            <R3>
              <BrokerBound />
            </R3>
          )}
        />
        <Route
          path="/broker/bind"
          exact
          render={() => (
            <R4>
              <BrokerBind />
            </R4>
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
            <R5>
              <BrokerSignUpStep2 />
            </R5>
          )}
        />
        <Route
          path="/broker/sign-up/step1"
          exact
          render={() => (
            <R6>
              <BrokerSignUpStep1 />
            </R6>
          )}
        />
        <Route
          path="/broker/sign-up/step2"
          exact
          render={() => (
            <R7>
              <BrokerSignUpStep2 />
            </R7>
          )}
        />
        <Route
          path="/broker/sign-up/step3"
          exact
          render={() => (
            <R8>
              <BrokerSignUpStep3 />
            </R8>
          )}
        />
        <Route path="/:id/broker/rank" exact render={() => <BrokerRank />} />
        <Route
          path="/:id/broker/workbench"
          exact
          render={() => (
            <R5 pathKey="broker/workbench">
              <BrokerWorkbench />
            </R5>
          )}
        />
        <Route
          path="/broker/profile/:id"
          exact
          render={() => (
            <R2>
              <BrokerInfo />
            </R2>
          )}
        />
        <Route path="/dashboard/overview" component={Overview} />
        <Route path="/dashboard/buyback" component={BuybackPlan} />
        <Route path="/dashboard/grant" render={GrantList} />
        <Route path="/faucet" render={() => <Faucet />} />
        <Route path="/space" render={() => <MySpace />} />
        <Route path="/apply" render={() => <UserApply />} />
        <Route path="/advisor" render={() => <Consultant />} />
        <Route path={`/${symbol}/system/parameters`} render={() => <System />} />
        <Route path="*" render={() => <Redirect to={`/${symbol}/trade`} />} />
      </Switch>
      <Toast />
      <AccessDeniedDialog visible={warning} />
    </>
  )
}

export default Web
