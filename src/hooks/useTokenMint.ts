import { TSigner } from '@/typings'
import { getTokenMintContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import { inputParameterConversion } from '@/utils/tools'

export const useTokenMint = () => {
  const mint = async (token: string, amount: string, signer: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getTokenMintContract(token, signer)
    const _amount = inputParameterConversion(amount, 8)

    try {
      const account = await signer.getAddress()
      console.info(`mint token:
     BUSD=${token}
     Amount=${amount}(${_amount})
     mint(wallet=${account},amount=${_amount})
     `)
      const gasLimit = await estimateGas(c, 'mint', [account, _amount])
      const response = await c.mint(account, _amount, { gasLimit })
      const receipt = await response.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { mint }
}
