import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Switch, Route } from '@/components/common/Route'

import { useInitialEffect } from '@/hooks/useInitialEffect'
import AccessDeniedDialog from '@/components/common/Wallet/AccessDenied'

import 'rc-dialog/assets/index.css'
import 'rc-collapse/assets/index.css'
import 'rc-tabs/assets/index.css'
import 'rc-table/assets/index.css'

import '@/style/style.scss'
import { getIP } from '@/api'

const WebEntry = lazy(() => import('@/pages/web'))

function App() {
  useInitialEffect()

  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    const func = async () => {
      const data = await getIP()
      setVisible(!data)
    }

    void func()

    if (typeof window?.geoip2 !== 'undefined') {
      window.geoip2?.country(function (response: { country: { iso_code: string } }) {
        if (response?.country?.iso_code.toUpperCase() === 'CN') setVisible(true)
      })
    }
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <Switch>
          <Route path="/" component={WebEntry} />
        </Switch>
      </Suspense>
      <AccessDeniedDialog visible={visible} />
    </>
  )
}

export default App
