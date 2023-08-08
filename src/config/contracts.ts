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
    [ChainId.MAINNET]: '0x6A936426323Af1d1Af61E57bA83Bdde4233687cD',
    [ChainId.TESTNET]: '0xCc632e817d113DcA1fEC9395615361E9c665B1C3'
  })
}

export default contracts
