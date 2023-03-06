import Contract from '@/class/Contract'
import { ChainId, ContractKeys } from '@/typings'

export const contracts: { [key in ContractKeys]: Contract } = {
  multicall: new Contract('multicall', {
    [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.TESTNET]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  }),
  derifyProtocol: new Contract('DerifyProtocol', {
    [ChainId.MAINNET]: '0x2e70e1C2B3660B91E07DEa476F36945aDFe1e4A1',
    [ChainId.TESTNET]: '0x516b21CB14522d5aCF336aff3907E6730846D620'
  }),
  derifyBroker: new Contract('DerifyBroker', {
    [ChainId.MAINNET]: '0x465e0019B1a51Ec5E4A6A26567Aff4E1806A76B6',
    [ChainId.TESTNET]: '0xC77B6bDCC2ABA23b5B968D3DE2A1aB827d9EAB07'
  })
}

export default contracts

export const findContract = (key: string): Contract => {
  // eslint-disable-next-line
  return Object.values(contracts).find((t) => t.contractAddress === key.toLowerCase())!
}
