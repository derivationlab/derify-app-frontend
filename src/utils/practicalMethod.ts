import { ethers } from 'ethers'
import { BigNumberish, Contract, BigNumber, Signer, constants } from 'ethers'

import { getBep20Contract } from '@/utils/contractHelpers'

const getAllowance = async (c: Contract, signer: Signer, spender: string): Promise<BigNumberish> => {
  if (!c) {
    throw new Error("Contract doesn't exist")
  }

  const account = await signer.getAddress()
  const allowance = await c.allowance(account, spender)

  return allowance
}

export const setAllowance = async (
  signer: Signer,
  spender: string,
  token: string,
  approveAmount: string | number
): Promise<boolean> => {
  const c = getBep20Contract(token, signer)

  try {
    const allowance = await getAllowance(c, signer, spender)
    // console.info(`allowance: ${formatUnits(String(allowance), 18)}`, BigNumber.from(allowance).lt(MaxUint256))
    if (BigNumber.from(allowance).lte(approveAmount)) {
      const gasLimit = await estimateGas(c, 'approve', [spender, constants.MaxUint256])
      const tx = await c.approve(spender, constants.MaxUint256, { gasLimit })
      const receipt = await tx.wait()

      return !!receipt.status
    }

    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const addToken2Wallet = async (
  address: string,
  symbol: string,
  decimals: number,
  image: string
): Promise<boolean> => {
  if (window?.ethereum?.request) {
    const status = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: { address, symbol, decimals, image }
      }
    })
    return status
  }
  return false
}

export const estimateGas = async (
  contract: Contract,
  methodName: string,
  methodArgs: unknown[] = [],
  gasMarginPer10000 = 0
): Promise<BigNumber> => {
  if (!contract[methodName]) {
    throw new Error(`Method ${methodName} doesn't exist on ${contract.address}`)
  }

  const rawGasEstimation = await contract.estimateGas[methodName](...methodArgs)
  // console.info(`real need gas:${rawGasEstimation}`)
  // console.info(
  //   `Gas after amplification:${rawGasEstimation
  //     .mul(ethers.BigNumber.from(10000).add(ethers.BigNumber.from(gasMarginPer10000)))
  //     .div(ethers.BigNumber.from(10000))}`
  // )
  return rawGasEstimation
    .mul(ethers.BigNumber.from(10000).add(ethers.BigNumber.from(gasMarginPer10000)))
    .div(ethers.BigNumber.from(10000))
}
