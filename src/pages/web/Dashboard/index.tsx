import React, { FC } from 'react'
import { useAccount } from 'wagmi'
import { Redirect, Switch, Route } from '@/components/common/Route'

import BrokerConnect from '@/pages/web/Broker/c/Connect'

import Overview from './Overview'
import BuybackPlan from './BuybackPlan'
import GrantList from './GrantList'

import { useMarginToken } from '@/store'

const Dashboard: FC = () => {
  const { address } = useAccount()

  const marginToken = useMarginToken((state) => state.marginToken)

  return (
    <Switch>
      <Route path="/dashboard" exact render={() => <Redirect to={`/${marginToken}/dashboard/overview`} />} />
      <Route path={`/${marginToken}/dashboard/overview`} component={Overview} />
      <Route path="/dashboard/buyback" component={BuybackPlan} />
      <Route path="/dashboard/grant" component={!address ? GrantList : BrokerConnect} />
    </Switch>
  )
}

export default Dashboard
