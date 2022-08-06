import React, { lazy, Suspense } from 'react'
import { Switch, Route } from '@/components/common/Route'

import 'rc-dialog/assets/index.css'
import 'rc-collapse/assets/index.css'
import 'rc-tabs/assets/index.css'
import 'rc-table/assets/index.css'
import '@/style/style.scss'

// const Mobile = lazy(() => import('@/pages/mobile'))
const WebVersionEntry = lazy(() => import('@/pages/web'))

function App() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={WebVersionEntry} />
      </Switch>
    </Suspense>
  )
}

export default App
// <Route path="/m" exact component={Mobile} />
