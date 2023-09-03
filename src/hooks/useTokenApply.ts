import contracts from '@/config/contracts'
import tokens from '@/config/tokens'
import { Rec, TSigner } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getConsultantContract } from '@/utils/contractHelpers'
import { inputParameterConversion } from '@/utils/tools'

export const useConsultant = () => {
  const addInsurance = async (signer: TSigner): Promise<boolean> => {
    if (!signer) return false
    const c = getConsultantContract(signer)
    const amount = inputParameterConversion(100000, 18)
    try {
      const approve = await allowanceApprove(
        signer,
        contracts.derifyConsultant.contractAddress,
        tokens.drf.tokenAddress,
        amount
      )
      if (!approve) return false
      const response = await c.addInsurance()
      const receipt = await response.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const getInsurance = async (account: string): Promise<Rec> => {
    const c = getConsultantContract()
    const response = await c.getInsurance(account)
    return response
  }

  const claimInsurance = async (signer: TSigner): Promise<boolean> => {
    if (!signer) return false
    const c = getConsultantContract(signer)
    try {
      const response = await c.claimInsurance()
      const receipt = await response.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return {
    addInsurance,
    getInsurance,
    claimInsurance
  }
}
