import Contract from '@/class/Contract'
import { ChainId, ContractKeys } from '@/typings'

export const contracts: { [key in ContractKeys]: Contract } = {
  multicall: new Contract('multicall', {
    [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.TESTNET]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  }),
  derifyProtocol: new Contract('DerifyProtocol', {
    [ChainId.MAINNET]: '0x2e70e1C2B3660B91E07DEa476F36945aDFe1e4A1',
    [ChainId.TESTNET]: '0x329693b193888Baad77F4036b40CCA4635F20d83'
  }),
  derifyConsultant: new Contract('DerifyConsultant', {
    [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
    [ChainId.TESTNET]: '0x52026A4C42DC7bfB920B8be08897707098c5CF64'
  }),
  derifyApply: new Contract('DerifyApply', {
    [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
    [ChainId.TESTNET]: '0xBaCA5953Bf7F91C1dB4C394aFf18Cb3c16C27e70'
  })
}

export default contracts
