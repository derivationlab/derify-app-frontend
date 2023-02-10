import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import ThemeProvider from '@/context/Theme'
import MobileProvider from '@/context/Mobile'
import QueryClientProvider from '@/providers/QueryClient'
import WagmiClientProvider from '@/providers/WagmiClient'
import { BrowserRouter } from '@/components/common/Route'
import store, { persistor } from '@/store'
import App from '@/App'
import '@/lang'

const _PersistGate = PersistGate as any
ReactDOM.render(
  <React.StrictMode>
    <MobileProvider>
      <Provider store={store}>
        <_PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <QueryClientProvider>
              <WagmiClientProvider>
                <ThemeProvider>
                  <App />
                </ThemeProvider>
              </WagmiClientProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </_PersistGate>
      </Provider>
    </MobileProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
