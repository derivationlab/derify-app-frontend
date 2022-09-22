import { Address } from '@/config/types'
import { getEnv } from '@/config/env'

// default address for prod
const addresses: Record<string, Address> = {
  multiCall: {
    56: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    97: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  },
  DerifyRewards: {
    56: '0x3EC8577f6b589F7eCe49278606b9bCb0F64b88e7',
    97: '0x7CcC51D79f2E147926426585476F090f00772B4C'
  },
  DerifyExchange: {
    56: '0x3F14b3C4C95EC4bc6E207f3368BC0044685D62De',
    97: '0x6c24A32865e33E181a6E770F0B1dEffb57549c76'
  },
  DerifyDerivative_BTC: {
    56: '0x0c8793d2967eB20A2677F682a41309C5650598de',
    97: '0x580bD831dF128c055504955D28a11109c953363C'
  },
  DerifyDerivative_ETH: {
    56: '0xa1061394d857c25b11C4D18b563a4A9dBAE486A7',
    97: '0xD2497B37E67C0C98dE536846243Cd9444fC4CE5f'
  },
  // todo del
  DerifyDerivative_BNB: {
    56: '0x2e97db10eC6D0Ee8ebF66621F77C9fC8497ff515',
    97: '0x2e97db10eC6D0Ee8ebF66621F77C9fC8497ff515'
  },
  DerifyBroker: {
    56: '0x10980bA734f766649E0622d30f0840EbdEB20eA8',
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
