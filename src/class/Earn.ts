import type { Signer } from 'ethers'

import { toHexString } from '@/utils/tools'
import { getDerifyRewardsContract } from '@/utils/contractHelpers'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import { getBDRFAddress, getDerifyRewardsAddress, getDRFAddress } from '@/utils/addressHelpers'

class Earn {
  // withdrawPositionReward
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

  // withdrawAllEdrf
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

  // stakingDrf
  traderStakingDrf = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const _amount = toHexString(amount)
      const approve = await setAllowance(signer, getDerifyRewardsAddress(), getDRFAddress(), _amount)

      if (!approve) return false

      const gasLimit = await estimateGas(contract, 'stakingDrf', [_amount], 0)
      const res = await contract.stakingDrf(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  // redeemDrf
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

  // withdrawAllBond
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

  // depositBondToBank
  traderPledgedBond = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const _amount = toHexString(amount)
      const approve = await setAllowance(signer, getDerifyRewardsAddress(), getBDRFAddress(), _amount)

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

  // redeemBondFromBank
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

  // exchangeBond
  traderExchangeBond = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyRewardsContract(signer)
    try {
      const _amount = toHexString(amount)
      const approve = await setAllowance(signer, getDerifyRewardsAddress(), getBDRFAddress(), _amount)

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
