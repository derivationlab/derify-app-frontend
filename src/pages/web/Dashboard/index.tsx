import { useAccount } from 'wagmi'

import React, { FC } from 'react'

import { Redirect, Switch, Route } from '@/components/common/Route'
import BrokerConnect from '@/pages/web/Broker/c/Connect'
import { useMarginTokenStore } from '@/store'

import BuybackPlan from './BuybackPlan'
import GrantList from './GrantList'
import Overview from './Overview'

const Dashboard: FC = () => {
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  return (
    <Switch>
      <Route path="/dashboard" exact render={() => <Redirect to={`/${marginToken.symbol}/dashboard/overview`} />} />
      <Route path={`/${marginToken.symbol}/dashboard/overview`} component={Overview} />
      <Route path="/dashboard/buyback" component={BuybackPlan} />
      <Route path="/dashboard/grant" component={!address ? GrantList : BrokerConnect} />
    </Switch>
  )
}

export default Dashboard
