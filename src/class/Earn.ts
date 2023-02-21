import type { Signer } from 'ethers'

import { toHexString } from '@/utils/tools'
import { getDerifyRewardsContract } from '@/utils/contractHelpers'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import { getbBUSDAddress, getDerifyRewardsAddress, getDRFAddress } from '@/utils/addressHelpers'

class Earn {
  traderWithdrawPMRewards = async (signer: Signer): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)

    try {
      const res = await contract.withdrawPositionReward()
      const receipt = await res.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  traderWithdrawEDRFRewards = async (signer: Signer): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const res = await contract.withdrawAllEdrf()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  traderStakingDrf = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const _amount1 = toHexString(Number(amount), 8)
      const _amount2 = toHexString(Number(amount), 18)

      const approve = await setAllowance(signer, getDerifyRewardsAddress(), getDRFAddress(), _amount2)

      if (!approve) return false

      const gasLimit = await estimateGas(contract, 'stakingDrf', [_amount1], 0)
      const res = await contract.stakingDrf(_amount1, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  traderRedeemDrf = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const _amount = toHexString(amount)

      const gasLimit = await estimateGas(contract, 'redeemDrf', [_amount], 0)
      const res = await contract.redeemDrf(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  traderWithdrawBond = async (signer: Signer): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const res = await contract.withdrawAllBond()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  traderPledgedBond = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const _amount = toHexString(amount)
      const approve = await setAllowance(signer, getDerifyRewardsAddress(), getbBUSDAddress(), _amount)

      if (!approve) return false

      const gasLimit = await estimateGas(contract, 'depositBondToBank', [_amount], 0)
      const res = await contract.depositBondToBank(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  traderRedemptionBond = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const _amount = toHexString(amount)

      const gasLimit = await estimateGas(contract, 'redeemBondFromBank', [_amount], 0)
      const res = await contract.redeemBondFromBank(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  traderExchangeBond = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const _amount = toHexString(amount)
      const approve = await setAllowance(signer, getDerifyRewardsAddress(), getbBUSDAddress(), _amount)

      if (!approve) return false

      const gasLimit = await estimateGas(contract, 'exchangeBond', [_amount], 0)
      const res = await contract.exchangeBond(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }
}

export default new Earn()
