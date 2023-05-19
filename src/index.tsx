import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import ThemeProvider from '@/providers/Theme'
import MobileProvider from '@/providers/Mobile'
import QueryClientProvider from '@/providers/QueryClient'
import WagmiClientProvider from '@/providers/WagmiClient'
import App from '@/App'
import '@/lang'

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
