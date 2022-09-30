import React, { lazy, Suspense } from 'react'
import { Switch, Route } from '@/components/common/Route'

import { useInitialEffect } from '@/hooks/useInitialEffect'
import AccessDeniedDialog from '@/components/common/Wallet/AccessDenied'

import 'rc-dialog/assets/index.css'
import 'rc-collapse/assets/index.css'
import 'rc-tabs/assets/index.css'
import 'rc-table/assets/index.css'

import '@/style/style.scss'

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  useInitialEffect()

  return (
    <>
      <Suspense fallback={null}>
        <Switch>
          <Route path="/" component={WebEntry} />
        </Switch>
      </Suspense>
      <AccessDeniedDialog visible={false} />
    </>
  )
}

export default App
