/// <reference types="react-scripts" />

interface Window {
  toast: any
  ethereum: GlobalType.Ethereum
}

namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_CHAIN_ID: '56' | '97'
  }
}

declare module 'store'
declare module 'pubsub-js'
