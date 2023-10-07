import { TSigner } from '@/typings'
import { getBep20Contract, getTokenMintContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import { inputParameterConversion } from '@/utils/tools'

async function calcMintAmount(token: string, amount: string): Promise<string> {
  const tokenContract = getBep20Contract(token)
  const decimals = await tokenContract.decimals()
  return inputParameterConversion(amount, Number(decimals))
}

export const useTokenMint = () => {
  const mint = async (token: string, amount: string, signer: TSigner): Promise<boolean> => {
    if (!signer) return false

    try {
      const mintContract = getTokenMintContract(token, signer)
      const _amount = await calcMintAmount(token, amount)
      const account = await signer.getAddress()
      const gasLimit = await estimateGas(mintContract, 'mint', [account, _amount])
      const response = await mintContract.mint(account, _amount, { gasLimit })
      const receipt = await response.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { mint }
}
