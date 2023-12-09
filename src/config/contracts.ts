import Contract from '@/class/Contract'
import { ChainId, ContractKeys } from '@/typings'

export const contracts: { [key in ContractKeys]: Contract } = {
  derifyProtocol: new Contract('DerifyProtocol', {
    [ChainId.MAINNET]: '0x2e70e1C2B3660B91E07DEa476F36945aDFe1e4A1',
    [ChainId.TESTNET]: '0x88972089Dab83A4541E1d9E07b1F6E0e99db119C'
  }),
  derifyConsultant: new Contract('DerifyConsultant', {
    [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
    [ChainId.TESTNET]: '0x70c74940097e7c1946263a0D471Bf47AF97a5C5A'
  }),
  derifyApply: new Contract('DerifyApply', {
    [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
    [ChainId.TESTNET]: '0x2665bF41127021FC3542676621E70B620278E260'
  }),
  multicall: new Contract('multicall', {
    [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.TESTNET]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  })
}

export default contracts
