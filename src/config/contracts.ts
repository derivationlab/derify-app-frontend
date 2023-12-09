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
    [ChainId.MAINNET]: '0x0fD8539Dd032E1e798236B7B03f5bAf906d3DfB9',
    [ChainId.TESTNET]: '0xCc632e817d113DcA1fEC9395615361E9c665B1C3'
  }),
  derifyConsultant: new Contract('DerifyConsultant', {
    [ChainId.MAINNET]: '0x1bF7eaD5aD61AaF23fcb011cbc3dc3Ee08c4Eec1',
    [ChainId.TESTNET]: '0x0706bbc99c38BcC796600aac6DfF56e814642443'
  }),
  derifyApply: new Contract('DerifyApply', {
    [ChainId.MAINNET]: '0x5791F44341fAC238BC98A029Bb43A3e5d8c09a3b',
    [ChainId.TESTNET]: '0x4f62BA86c0285fe3A8Fc5ce004ddDEc49C26eeCb'
  })
}

export default contracts
