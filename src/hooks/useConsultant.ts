import contracts from '@/config/contracts'
import tokens, { PLATFORM_TOKEN } from '@/config/tokens'
import { TSigner } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getConsultantContract } from '@/utils/contractHelpers'
import { inputParameterConversion } from '@/utils/tools'

export const useConsultant = () => {
  const addInsurance = async (signer: TSigner): Promise<boolean> => {
    if (!signer) return false
    const c = getConsultantContract(signer)
    const amount = inputParameterConversion(100000, PLATFORM_TOKEN.precision)
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
    claimInsurance
  }
}