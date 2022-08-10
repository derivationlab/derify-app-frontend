import React from 'react'
import ReactDOM from 'react-dom'
import { WagmiConfig } from 'wagmi'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import ThemeProvider from '@/context/Theme'
import MobileProvider from '@/context/Mobile'
import { BrowserRouter } from '@/components/common/Route'
import App from '@/App'
import { client } from '@/lib'
import store, { persistor } from '@/store'
import '@/lang'

const _PersistGate = PersistGate as any
ReactDOM.render(
  <React.StrictMode>
    <MobileProvider>
      <Provider store={store}>
        <_PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <WagmiConfig client={client}>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </WagmiConfig>
          </BrowserRouter>
        </_PersistGate>
      </Provider>
    </MobileProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
