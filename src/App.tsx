import 'rc-collapse/assets/index.css'
import 'rc-dialog/assets/index.css'
import 'rc-table/assets/index.css'
import 'rc-tabs/assets/index.css'

import React, { lazy, Suspense } from 'react'
import toast from 'react-hot-toast'
import { Route, Switch } from 'react-router-dom'

import Spinner from '@/components/common/Spinner'
import { useMarginLoading } from '@/hooks/useMarginLoading'
import GlobalUpdater from '@/pages/updater/GlobalUpdater'
import '@/style/style.scss'

window.toast = toast

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  const { isAccessible } = useMarginLoading()

  if (!isAccessible) return <Spinner fixed />

  return (
    <>
      <GlobalUpdater />

      <Suspense fallback={null}>
        <Switch>
          <Route path="/" component={WebEntry} />
        </Switch>
      </Suspense>
    </>
  )
}

export default App
