import { Address } from '@/config/types'
import { getEnv } from '@/config/env'

// default address for prod
const addresses: Record<string, Address> = {
  multiCall: {
    56: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    97: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  },
  DerifyRewards: {
    56: '0x755BAEeeE6F506278C2BD692F89e1aa25FE3f394',
    97: '0x4922D9769197d3FE27c3c6c4372D3fb76C49B27E'
  },
  DerifyExchange: {
    56: '0x75777494496f6250DdB9A1B96a6203e219d3698f',
    97: '0x4a8021a4f721D650754864c349Df570De061a8c3'
  },
  DerifyDerivative_BTC: {
    56: '0x072A504a10d0291865197AA49Ca6B30F6E7BB9EE',
    97: '0x022cfc9BE1D64bf670369d1078591e6B43B47fD3'
  },
  DerifyDerivative_ETH: {
    56: '0x396d8f9428387c2DBaAFDf1D9fC8abb00E055347',
    97: '0xfcB8AB7C7Eb54DbB40bdC78bDB1982bA3944eE27'
  },
  // todo del
  DerifyDerivative_BNB: {
    56: '0x2e97db10eC6D0Ee8ebF66621F77C9fC8497ff515',
    97: '0xe7eCE523460CeB26b4f49a49399Bdf4A165d089F'
  },
  DerifyBroker: {
    56: '0x465e0019B1a51Ec5E4A6A26567Aff4E1806A76B6',
    97: '0x799CE3C1bAdcFd81f99288dEA09DDcC83fd15748'
  }
}

const envTable: { [string: string]: Record<string, Address> } = {
  dev: {},
  prod: {}
}

export default Object.assign(addresses, envTable[getEnv()])
