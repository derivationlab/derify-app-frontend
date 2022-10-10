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
    97: '0x7CcC51D79f2E147926426585476F090f00772B4C'
  },
  DerifyExchange: {
    56: '0x75777494496f6250DdB9A1B96a6203e219d3698f',
    97: '0x6c24A32865e33E181a6E770F0B1dEffb57549c76'
  },
  DerifyDerivative_BTC: {
    56: '0x072A504a10d0291865197AA49Ca6B30F6E7BB9EE',
    97: '0x580bD831dF128c055504955D28a11109c953363C'
  },
  DerifyDerivative_ETH: {
    56: '0x396d8f9428387c2DBaAFDf1D9fC8abb00E055347',
    97: '0xD2497B37E67C0C98dE536846243Cd9444fC4CE5f'
  },
  // todo del
  DerifyDerivative_BNB: {
    56: '0x2e97db10eC6D0Ee8ebF66621F77C9fC8497ff515',
    97: '0x2e97db10eC6D0Ee8ebF66621F77C9fC8497ff515'
  },
  DerifyBroker: {
    56: '0x465e0019B1a51Ec5E4A6A26567Aff4E1806A76B6',
    97: '0x265A3dD6dcCBA9a59fAd0c9228d3327A030fcF63'
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
    DerifyDerivative_BNB: {
      56: '',
      97: '0xC116016dBe7d2620B77fC044dF687e2e1C99dfd8'
    },
    DerifyBroker: {
      56: '',
      97: '0x5ee4b4801aE40391899D702d7B786cF68D8520E9'
    }
  },
  prod: {}
}

export default Object.assign(addresses, envTable[getEnv()])
