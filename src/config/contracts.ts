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
    97: '0x1658E3aF82077eE873824D02aE6f020506bd73Ff'
  },
  DerifyExchange: {
    56: '0x75777494496f6250DdB9A1B96a6203e219d3698f',
    97: '0x196E6eE11c3D2AAaB0a0A81c1Ca50A362836e9b1'
  },
  DerifyBroker: {
    56: '0x465e0019B1a51Ec5E4A6A26567Aff4E1806A76B6',
    97: '0x610e57f64E3fe49f221c3BE24e2CfD8cd19250C6'
  }
}

const envTable: { [string: string]: Record<string, Address> } = {
  dev: {},
  prod: {}
}

export default Object.assign(addresses, envTable[getEnv()])
