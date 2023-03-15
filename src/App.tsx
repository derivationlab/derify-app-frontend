import toast from 'react-hot-toast'
import { Route, Switch } from 'react-router-dom'
import React, { lazy, Suspense } from 'react'

import 'rc-dialog/assets/index.css'
import 'rc-collapse/assets/index.css'
import 'rc-tabs/assets/index.css'
import 'rc-table/assets/index.css'

import BrokerUpdater from '@/pages/updater/BrokerUpdater'
import InitialUpdater from '@/pages/updater/InitialUpdater'

import '@/style/style.scss'

window.toast = toast

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  return (
    <>
      <InitialUpdater />
      <BrokerUpdater />

      <Suspense fallback={null}>
        <Switch>
          <Route path="/" component={WebEntry} />
        </Switch>
      </Suspense>
    </>
  )
}

export default App
