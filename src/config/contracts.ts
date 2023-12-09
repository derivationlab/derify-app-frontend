import Contract from '@/class/Contract'
import { ChainId, ContractKeys } from '@/typings'

export const contracts: { [key in ContractKeys]: Contract } = {
  multicall: new Contract('multicall', {
    [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.TESTNET]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  }),
  derifyPool: new Contract('DerifyPool', {
    [ChainId.MAINNET]: '0x755BAEeeE6F506278C2BD692F89e1aa25FE3f394',
    [ChainId.TESTNET]: '0x4922D9769197d3FE27c3c6c4372D3fb76C49B27E'
  }),
  derifyProtocol: new Contract('DerifyProtocol', {
    [ChainId.MAINNET]: '0xd09c3Ed28d2b52223C3B3172A80D5C91B5091b15',
    [ChainId.TESTNET]: '0xCc632e817d113DcA1fEC9395615361E9c665B1C3'
  }),
  derifyConsultant: new Contract('DerifyConsultant', {
    [ChainId.MAINNET]: '0x40f68ea3f599DDf4A09A9a196092990681E95A36',
    [ChainId.TESTNET]: '0x0706bbc99c38BcC796600aac6DfF56e814642443'
  }),
  derifyApply: new Contract('DerifyApply', {
    [ChainId.MAINNET]: '0x62599c6AC0c22BfBf3231B2EA9817fa8D6879584',
    [ChainId.TESTNET]: '0x4f62BA86c0285fe3A8Fc5ce004ddDEc49C26eeCb'
  })
}

export default contracts
