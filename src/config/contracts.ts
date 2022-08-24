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
      97: '0x027d27912038cC00F88acD11B7522f29B8E6fF50'
    },
    DerifyExchange: {
      56: '',
      97: '0x30Daa58D5437F17009ccCe887154b68fb7e14b82'
    },
    DerifyDerivative_BTC: {
      56: '',
      97: '0x19f0F618E717E861A0eaa1b539B91dD795E264A5'
    },
    DerifyDerivative_ETH: {
      56: '',
      97: '0xC8B5268E89698147054b2dCf1184Dcf5C6D83E74'
    },
    DerifyBroker: {
      56: '',
      97: '0x5c3b30fB8cf399Eaef89B9f2860f3f910EB25Ea1'
    }
  },
  prod: {}
}

export default Object.assign(addresses, envTable[getEnv()])
