import { TSigner } from '@/typings'
import { getTokenMintContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import { inputParameterConversion } from '@/utils/tools'

export const useTokenMint = () => {
  const mint = async (token: string, amount: string, signer: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getTokenMintContract(signer)
    const _amount = inputParameterConversion(amount, 8)

    try {
      const gasLimit = await estimateGas(c, 'mint', [token, _amount])
      const response = await c.mint(token, _amount, { gasLimit })
      const receipt = await response.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { mint }
}
