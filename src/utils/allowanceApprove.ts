import type { Signer } from 'ethers'
import { BigNumberish, Contract, BigNumber } from 'ethers'

import tokens from '@/config/tokens'
import { estimateGas } from '@/utils/estimateGas'
import { getBep20Contract } from '@/utils/contractHelpers'

const getAllowance = async (c: Contract, signer: Signer, spender: string): Promise<BigNumberish> => {
  if (!c) {
    throw new Error("Contract doesn't exist")
  }

  const account = await signer.getAddress()
  const allowance = await c.allowance(account, spender)

  return allowance
}

export const allowanceApprove = async (
  signer: Signer,
  spender: string,
  token: string,
  amount: string
): Promise<boolean> => {
  if (token === tokens.eth.tokenAddress) return true

  const c = getBep20Contract(token, signer)

  try {
    const allowance = await getAllowance(c, signer, spender)

    if (BigNumber.from(allowance).lt(amount)) {
      const gasLimit = await estimateGas(c, 'approve', [spender, amount])
      const tx = await c.approve(spender, amount, { gasLimit })
      const receipt = await tx.wait()

      return !!receipt.status
    }

    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
