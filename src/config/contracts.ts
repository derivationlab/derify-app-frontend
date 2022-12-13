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
    97: '0xB967748699eBD7ac9460e88A4061027Be9a5d948'
  },
  DerifyExchange: {
    56: '0x75777494496f6250DdB9A1B96a6203e219d3698f',
    97: '0x02Af6F9425593a1C2BA5038a7C650EA3A607858E'
  },
  DerifyBroker: {
    56: '0x465e0019B1a51Ec5E4A6A26567Aff4E1806A76B6',
    97: '0xC77B6bDCC2ABA23b5B968D3DE2A1aB827d9EAB07'
  }
}

const envTable: { [string: string]: Record<string, Address> } = {
  dev: {},
  prod: {}
}

export default Object.assign(addresses, envTable[getEnv()])
