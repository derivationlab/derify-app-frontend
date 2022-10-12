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
    97: '0x7CcC51D79f2E147926426585476F090f00772B4C'
  },
  DerifyExchange: {
    56: '',
    97: '0x6c24A32865e33E181a6E770F0B1dEffb57549c76'
  },
  DerifyDerivative_BTC: {
    56: '',
    97: '0x580bD831dF128c055504955D28a11109c953363C'
  },
  DerifyDerivative_ETH: {
    56: '',
    97: '0xD2497B37E67C0C98dE536846243Cd9444fC4CE5f'
  },
  DerifyDerivative_BNB: {
    56: '',
    97: '0x2e97db10eC6D0Ee8ebF66621F77C9fC8497ff515'
  },
  DerifyBroker: {
    56: '',
    97: '0x265A3dD6dcCBA9a59fAd0c9228d3327A030fcF63'
  }
}

const envTable: { [string: string]: Record<string, Address> } = {
  dev: {},
  prod: {}
}

export default Object.assign(addresses, envTable[getEnv()])
