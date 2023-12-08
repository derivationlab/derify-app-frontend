import Contract from '@/class/Contract'
import { ChainId, ContractKeys } from '@/typings'

export const contracts: { [key in ContractKeys]: Contract } = {
  derifyProtocol: new Contract('DerifyProtocol', {
    [ChainId.MAINNET]: '0x2e70e1C2B3660B91E07DEa476F36945aDFe1e4A1',
    [ChainId.TESTNET]: '0x1b704a8ee3591Ec26fa235B232983563BF904Cc1'
  }),
  derifyConsultant: new Contract('DerifyConsultant', {
    [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
    [ChainId.TESTNET]: '0xD8C3DFC921c4464DEFCC0EDB76cf361805d252C7'
  }),
  derifyApply: new Contract('DerifyApply', {
    [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
    [ChainId.TESTNET]: '0xBcEbC6177ab893574f066aEeED608f8E9aE9274d'
  }),
  multicall: new Contract('multicall', {
    [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.TESTNET]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  })
}

export default contracts
