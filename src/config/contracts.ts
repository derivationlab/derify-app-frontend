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
      97: '0xA069E21F555e1eEF78B0f29A43f8a23927B4ad47'
    },
    DerifyExchange: {
      56: '',
      97: '0x00430C1ADdd52cE7190d35B4e01D91AAa8FC0265'
    },
    DerifyDerivative_BTC: {
      56: '',
      97: '0xF327d17e8a5f13965a01eCfB39A40D93b8DEF688'
    },
    DerifyDerivative_ETH: {
      56: '',
      97: '0x6666E0cE23D34e744EC2a0D6D55f715045fA5cB0'
    },
    DerifyBroker: {
      56: '',
      97: '0xD8039B5bEC0FC18e2BcA4994a250b2AED140Be40'
    }
  },
  prod: {}
}

export default Object.assign(addresses, envTable[getEnv()])
