/// <reference types="react-scripts" />

interface Window {
  toast: any
  geoip2: any
  ethereum?: {
    request: (...args: unknown[]) => Promise<any>
    on: (p: string, f?: (k: unknown) => void) => void
  }
}

namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_CHAIN_ID: '56' | '97'
  }
}

declare module 'store'

declare module 'qrcode'
