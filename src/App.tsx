import React, { lazy, Suspense } from 'react'

import 'rc-dialog/assets/index.css'
import 'rc-collapse/assets/index.css'
import 'rc-tabs/assets/index.css'
import 'rc-table/assets/index.css'

import { useInitialDAT } from '@/hooks/useInitialDAT'
import { Switch, Route } from '@/components/common/Route'

import '@/style/style.scss'
import { useInitialEffect } from '@/hooks/useInitialEffect'

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  useInitialDAT()

  // todo
  useInitialEffect()

  return (
    <>
      <Suspense fallback={null}>
        <Switch>
          <Route path="/" component={WebEntry} />
        </Switch>
      </Suspense>
    </>
  )
}

export default App
