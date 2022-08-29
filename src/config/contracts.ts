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
    97: '0x895981b73A2CF54F1aF3d433D40f407e49309f0C'
  },
  DerifyExchange: {
    56: '',
    97: '0x88E1C1f39B3468f185C607E75b2ff307A5085D1E'
  },
  DerifyDerivative_BTC: {
    56: '',
    97: '0x166d4038360f05226799bADbcA55ee40019BB9D9'
  },
  DerifyDerivative_ETH: {
    56: '',
    97: '0x2E444Fd151B52E9e9119a713cb0C3643bF4D7a1E'
  },
  DerifyBroker: {
    56: '',
    97: '0x64afbB172F813b2901A4e9A0c13317684972249C'
  }
}

const envTable: { [string: string]: Record<string, Address> } = {
  dev: {
    DerifyRewards: {
      56: '',
      97: '0x849E0B8eB97753857b71Edf2CbC6E1E0bC2D5837'
    },
    DerifyExchange: {
      56: '',
      97: '0x766326B2eD618285b1e8014e6e9650C05808e617'
    },
    DerifyDerivative_BTC: {
      56: '',
      97: '0xffe20ae02fA7E808d61a493f4BE6615e3a405278'
    },
    DerifyDerivative_ETH: {
      56: '',
      97: '0xA5d35BE0299377749C2F617190c0bc48d7a4eF8f'
    },
    DerifyBroker: {
      56: '',
      97: '0x5ee4b4801aE40391899D702d7B786cF68D8520E9'
    }
  },
  prod: {}
}

export default Object.assign(addresses, envTable[getEnv()])
