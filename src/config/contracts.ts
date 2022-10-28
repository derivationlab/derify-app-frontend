import { Address } from '@/config/types'
import { getEnv } from '@/config/env'

// default address for prod
const addresses: Record<string, Address> = {
  multiCall: {
    56: '',
    97: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  },
  DerifyRewards: {
    56: '',
    97: '0x4922D9769197d3FE27c3c6c4372D3fb76C49B27E'
  },
  DerifyExchange: {
    56: '',
    97: '0x4a8021a4f721D650754864c349Df570De061a8c3'
  },
  DerifyDerivative_BTC: {
    56: '',
    97: '0x022cfc9BE1D64bf670369d1078591e6B43B47fD3'
  },
  DerifyDerivative_ETH: {
    56: '',
    97: '0xfcB8AB7C7Eb54DbB40bdC78bDB1982bA3944eE27'
  },
  DerifyDerivative_BNB: {
    56: '',
    97: '0xe7eCE523460CeB26b4f49a49399Bdf4A165d089F'
  },
  DerifyBroker: {
    56: '',
    97: '0x799CE3C1bAdcFd81f99288dEA09DDcC83fd15748'
  }
}

const envTable: { [string: string]: Record<string, Address> } = {
  dev: {},
  prod: {}
}

export default Object.assign(addresses, envTable[getEnv()])
