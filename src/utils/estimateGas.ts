import { BigNumber } from 'ethers'
import type { BigNumber as BN, Contract } from 'ethers'

export const estimateGas = async (
  contract: Contract,
  methodName: string,
  methodArgs: any[] = [],
  gasMarginPer10000 = 0
): Promise<BN> => {
  const base = BigNumber.from(10000)
  const margin = BigNumber.from(gasMarginPer10000)

  if (!contract[methodName]) {
    throw new Error(`Method ${methodName} doesn't exist on ${contract.address}`)
  }

  const rawGasEstimation = await contract.estimateGas[methodName](...methodArgs)
  // console.info(`real gas:${rawGasEstimation}`)
  // console.info(`gas margin:${rawGasEstimation.mul(base.add(margin)).div(base)}`)
  return rawGasEstimation.mul(base.add(margin)).div(base)
}
