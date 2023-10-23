import lowLatencyNode from 'low-latency-node-helper'

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App'
import '@/i18n'
import QueryClientProvider from '@/providers/QueryClient'
import ThemeProvider from '@/providers/Theme'
import WagmiClientProvider from '@/providers/WagmiClient'

lowLatencyNode(process.env.REACT_APP_CHAIN_ID)

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider>
        <ThemeProvider>
          <WagmiClientProvider>
            <App />
          </WagmiClientProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
