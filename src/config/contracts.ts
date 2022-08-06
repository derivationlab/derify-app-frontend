import { Address } from '@/config/types'

const addresses: Record<string, Address> = {
  multiCall: {
    // 56: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    56: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576',
    97: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  },
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
  DerifyFactory: {
    56: '',
    97: '0xc43eCe22427971C1f78002fE1A57E0eAf328d0db'
  },
  DerifyBroker: {
    56: '',
    97: '0xD8039B5bEC0FC18e2BcA4994a250b2AED140Be40'
  },
  DerifyClearing: {
    56: '',
    97: '0xD0c4464b1AC42C964f22F77A967780ee9850c047'
  },
  CommunityVestingVault: {
    56: '',
    97: '0xe225CdFC868c3D68812c1279164D2fef6C8827C1'
  }
}

export default addresses
