import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App'
import '@/lang'
import MobileProvider from '@/providers/Mobile'
import QueryClientProvider from '@/providers/QueryClient'
import ThemeProvider from '@/providers/Theme'
import WagmiClientProvider from '@/providers/WagmiClient'

ReactDOM.render(
  <React.StrictMode>
    <MobileProvider>
      <BrowserRouter>
        <QueryClientProvider>
          <ThemeProvider>
            <WagmiClientProvider>
              <App />
            </WagmiClientProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </MobileProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
