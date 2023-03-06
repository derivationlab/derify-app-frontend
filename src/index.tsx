import React from 'react'
import ReactDOM from 'react-dom'

import ThemeProvider from '@/context/Theme'
import MobileProvider from '@/context/Mobile'
import QueryClientProvider from '@/providers/QueryClient'
import WagmiClientProvider from '@/providers/WagmiClient'
import { BrowserRouter } from '@/components/common/Route'
import App from '@/App'
import '@/lang'

ReactDOM.render(
  <React.StrictMode>
    <MobileProvider>
      <BrowserRouter>
        <QueryClientProvider>
          <WagmiClientProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </WagmiClientProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </MobileProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
