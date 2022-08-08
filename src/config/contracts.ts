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
    97: '0x953668ffcDB8DFF2d26BAF77cff3c289d8435acf'
  },
  DerifyExchange: {
    56: '',
    97: '0xaA7E363ba770A743C7100cF722AD236641035468'
  },
  DerifyDerivative_BTC: {
    56: '',
    97: '0x08D6b960E9a73F5936233796B15E45FbA530c9Dd'
  },
  DerifyDerivative_ETH: {
    56: '',
    97: '0x5c4a09863d8DbC7F8c1E831d3c76250946D6313F'
  },
  DerifyBroker: {
    56: '',
    97: '0xF86441B0e309c77A17bB964C0f2Ea7D8b16F0928'
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
