import Contract from '@/class/Contract'
import { ChainId, ContractKeys } from '@/typings'

export const contracts: { [key in ContractKeys]: Contract } = {
  multicall: new Contract('multicall', {
    [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.TESTNET]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  }),
  derifyProtocol: new Contract('DerifyProtocol', {
    [ChainId.MAINNET]: '0x2e70e1C2B3660B91E07DEa476F36945aDFe1e4A1',
    [ChainId.TESTNET]: '0x3F5902E6257CeA812B8781cFC45Ec56317C44e30'
  }),
  derifyConsultant: new Contract('DerifyConsultant', {
    [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
    [ChainId.TESTNET]: '0x0706bbc99c38BcC796600aac6DfF56e814642443'
  })
}

export default contracts
