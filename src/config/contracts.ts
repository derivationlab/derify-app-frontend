import Contract from '@/class/Contract'
import { ChainId, ContractKeys } from '@/typings'

export const contracts: { [key in ContractKeys]: Contract } = {
  multicall: new Contract('multicall', {
    [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.TESTNET]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  }),
  derifyProtocol: new Contract('DerifyProtocol', {
    [ChainId.MAINNET]: '0x2e70e1C2B3660B91E07DEa476F36945aDFe1e4A1',
    [ChainId.TESTNET]: '0x6b185A1AF1958Ac2D46Da56A4661c3cc8A9C85e5'
  }),
  derifyConsultant: new Contract('DerifyConsultant', {
    [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
    [ChainId.TESTNET]: '0x3E9356979859a6FE546AAed6e0D9E48578D3f353'
  }),
  derifyApply: new Contract('DerifyApply', {
    [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
    [ChainId.TESTNET]: '0x639df41C3F06de60aD61B65eFE9C20089eE6754f'
  })
}

export default contracts
