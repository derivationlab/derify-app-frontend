import React, { lazy, Suspense } from 'react'
import { Switch, Route } from '@/components/common/Route'

import 'rc-dialog/assets/index.css'
import 'rc-collapse/assets/index.css'
import 'rc-tabs/assets/index.css'
import 'rc-table/assets/index.css'

import '@/style/style.scss'
import { useInitialEffect } from '@/hooks/useInitialEffect'

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  useInitialEffect()

  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={WebEntry} />
      </Switch>
    </Suspense>
  )
}

export default App
