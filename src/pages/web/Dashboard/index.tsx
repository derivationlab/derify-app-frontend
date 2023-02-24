import React, { FC } from 'react'
import { useAccount } from 'wagmi'
import { Redirect, Switch, Route } from '@/components/common/Route'

import BrokerConnect from '@/pages/web/Broker/c/Connect'

import Overview from './Overview'
import BuybackPlan from './BuybackPlan'
import GrantList from './GrantList'

const Dashboard: FC = () => {
  const { data: account } = useAccount()
  return (
    <Switch>
      <Route path="/dashboard" exact render={() => <Redirect to="/dashboard/overview" />} />
      <Route path="/dashboard/overview" component={Overview} />
      <Route path="/dashboard/buyback-plan" component={BuybackPlan} />
      <Route path="/dashboard/grant-list" component={account?.address ? GrantList : BrokerConnect} />
    </Switch>
  )
}

export default Dashboard
