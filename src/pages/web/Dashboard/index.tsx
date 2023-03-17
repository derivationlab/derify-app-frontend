import React, { FC } from 'react'
import { useAccount } from 'wagmi'
import { Redirect, Switch, Route } from '@/components/common/Route'

import BrokerConnect from '@/pages/web/Broker/c/Connect'

import Overview from './Overview'
import BuybackPlan from './BuybackPlan'
import GrantList from './GrantList'
import { useMTokenFromRoute } from '@/hooks/useTrading'

const Dashboard: FC = () => {
  const { address } = useAccount()

  const { marginToken } = useMTokenFromRoute()

  return (
    <Switch>
      <Route path="/dashboard" exact render={() => <Redirect to={`/${marginToken}/dashboard/overview`} />} />
      <Route path={`/${marginToken}/dashboard/overview`} component={Overview} />
      <Route path="/dashboard/buyback-plan" component={BuybackPlan} />
      <Route path="/dashboard/grant-list" component={!address ? GrantList : BrokerConnect} />
    </Switch>
  )
}

export default Dashboard
