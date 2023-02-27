import Contract from '@/class/Contract'
import { ChainId, ContractKeys } from '@/typings'

export const contracts: { [key in ContractKeys]: Contract } = {
  multicall: new Contract('multicall', {
    [ChainId.MAINNET]: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    [ChainId.TESTNET]: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576'
  }),
  derifyProtocol: new Contract('DerifyProtocol', {
    [ChainId.MAINNET]: '0x2e70e1C2B3660B91E07DEa476F36945aDFe1e4A1',
    [ChainId.TESTNET]: '0x0a5F5FA5717C0e2247A989032cBfc8d17A2a8A9F'
  })
}

export default contracts

export const findContract = (key: string): Contract => {
  // eslint-disable-next-line
  return Object.values(contracts).find((t) => t.contractAddress === key.toLowerCase())!
}
