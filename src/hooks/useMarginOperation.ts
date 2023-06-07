import { marginToken } from '@/store'
import { TSigner } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getDerifyExchangeContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import { inputParameterConversion } from '@/utils/tools'

export const useMarginOperation = () => {
  const deposit = async (
    exchange: string,
    amount: string,
    margin: typeof marginToken,
    signer?: TSigner
  ): Promise<boolean> => {
    if (!signer) return false
    let approve = false
    const c = getDerifyExchangeContract(exchange, signer)
    const _amount1 = inputParameterConversion(amount, margin.symbol === 'BNB' ? 18 : 8)
    const _amount2 = inputParameterConversion(amount, 18)

    try {
      if (margin.symbol === 'BNB') approve = true
      else {
        approve = await allowanceApprove(signer, exchange, margin.address, _amount2)
      }

      if (!approve) return false

      const gasLimit = await estimateGas(c, 'deposit', [_amount1])
      const res = await c.deposit(_amount1, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
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
