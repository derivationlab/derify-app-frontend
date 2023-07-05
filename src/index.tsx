import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App'
import '@/i18n'
import QueryClientProvider from '@/providers/QueryClient'
import ThemeProvider from '@/providers/Theme'
import WagmiClientProvider from '@/providers/WagmiClient'

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
