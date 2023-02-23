import React, { FC } from 'react'
import { Redirect, Switch, Route } from '@/components/common/Route'

import Overview from './Overview'
import BuybackPlan from './BuybackPlan'
import GrantList from './GrantList'

const Dashboard: FC = () => {
  return (
    <>
      <Switch>
        <Route path="/dashboard" exact render={() => <Redirect to="/dashboard/overview" />} />
        <Route path="/dashboard/overview" component={Overview} />
        <Route path="/dashboard/buyback-plan" component={BuybackPlan} />
        <Route path="/dashboard/grant-list" component={GrantList} />
      </Switch>
    </>
  )
}

export default Dashboard
