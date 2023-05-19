import toast from 'react-hot-toast'
import { Route, Switch } from 'react-router-dom'
import React, { lazy, Suspense } from 'react'
import 'rc-dialog/assets/index.css'
import 'rc-collapse/assets/index.css'
import 'rc-tabs/assets/index.css'
import 'rc-table/assets/index.css'
import { useMarginLoading } from '@/hooks/useMarginLoading'
import BrokerUpdater from '@/pages/updater/BrokerUpdater'
import GlobalUpdater from '@/pages/updater/GlobalUpdater'
import GlobalUpdater1 from '@/pages/updater/GlobalUpdater1'
import Spinner from '@/components/common/Spinner'
import '@/style/style.scss'

window.toast = toast

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  const { isAccessible } = useMarginLoading()

  if (!isAccessible) return <Spinner fixed />

  return (
    <>
      <GlobalUpdater />
      <GlobalUpdater1 />
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
