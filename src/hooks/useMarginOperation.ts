import type { Contract } from '@ethersproject/contracts'
import type { Signer } from 'ethers'

import { marginToken } from '@/store'
import { TSigner } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getDerifyExchangeContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import { inputParameterConversion } from '@/utils/tools'

const depositMarginForWBNB = async (contract: Contract, amount: string): Promise<boolean> => {
  const _amount = inputParameterConversion(amount, 18)
  const gasLimit = await estimateGas(contract, 'deposit', [_amount, { value: _amount }])
  const res = await contract.deposit(_amount, { gasLimit, value: _amount })
  const receipt = await res.wait()
  return receipt.status
}

const depositMarginForNormal = async (
  contract: Contract,
  exchange: string,
  amount: string,
  margin: string,
  signer: Signer
): Promise<boolean> => {
  const _amount1 = inputParameterConversion(amount, 8)
  const _amount2 = inputParameterConversion(amount, 18)
  const approve = await allowanceApprove(signer, exchange, margin, _amount2)
  if (!approve) return false
  const gasLimit = await estimateGas(contract, 'deposit', [_amount1])
  const res = await contract.deposit(_amount1, { gasLimit })
  const receipt = await res.wait()
  return receipt.status
}

export const useMarginOperation = () => {
  const deposit = async (
    exchange: string,
    amount: string,
    margin: typeof marginToken,
    signer?: TSigner
  ): Promise<boolean> => {
    if (!signer) return false
    const contract = getDerifyExchangeContract(exchange, signer)
    try {
      if (margin.symbol === 'BNB') {
        const status = await depositMarginForWBNB(contract, amount)
        return status
      } else {
        const status = await depositMarginForNormal(contract, exchange, amount, margin.address, signer)
        return status
      }
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const withdraw = async (exchange: string, amount: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyExchangeContract(exchange, signer)

    try {
      const _amount = inputParameterConversion(amount, 8)

      const gasLimit = await estimateGas(c, 'withdraw', [_amount])
      const res = await c.withdraw(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { deposit, withdraw }
}
