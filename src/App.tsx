import 'rc-collapse/assets/index.css'
import 'rc-dialog/assets/index.css'
import 'rc-table/assets/index.css'
import 'rc-tabs/assets/index.css'

import React, { lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import Spinner from '@/components/common/Spinner'
import { useMarginLoading } from '@/hooks/useMarginLoading'
import Initial from '@/pages/web/initial'
import '@/style/style.scss'

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  const { isAccessible } = useMarginLoading()
  if (!isAccessible) return <Spinner fixed />

  return (
    <>
      <Initial />

      <Suspense fallback={<Spinner fixed />}>
        <Switch>
          <Route path="/" component={WebEntry} />
        </Switch>
      </Suspense>
    </>
  )
}

export default App
