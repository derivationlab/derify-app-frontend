import contracts from '@/config/contracts'
import tokens from '@/config/tokens'
import { TSigner } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getRewardsContract, getProtocolContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import { inputParameterConversion } from '@/utils/tools'

export const useMiningOperation = () => {
  const redeemDrf = async (amount: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getProtocolContract(signer)
    const _amount = inputParameterConversion(amount, 8)

    try {
      const gasLimit = await estimateGas(c, 'redeemDrf', [_amount])
      const res = await c.redeemDrf(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const stakingDrf = async (amount: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getProtocolContract(signer)
    const _amount1 = inputParameterConversion(amount, 8)
    const _amount2 = inputParameterConversion(amount, 18)

    try {
      const approve = await allowanceApprove(
        signer,
        contracts.derifyProtocol.contractAddress,
        tokens.drf.tokenAddress,
        _amount2
      )

      if (!approve) return false

      const gasLimit = await estimateGas(c, 'stakingDrf', [_amount1])
      const res = await c.stakingDrf(_amount1, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const exchangeBond = async (
    rewards: string,
    bMarginToken: string,
    amount: string,
    signer?: TSigner
  ): Promise<boolean> => {
    if (!signer) return false

    const c = getRewardsContract(rewards, signer)
    const _amount1 = inputParameterConversion(amount, 8)
    const _amount2 = inputParameterConversion(amount, 18)

    try {
      const approve = await allowanceApprove(signer, rewards, bMarginToken, _amount2)

      if (!approve) return false

      const gasLimit = await estimateGas(c, 'exchangeBond', [_amount1])
      const res = await c.exchangeBond(_amount1, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const withdrawAllBond = async (rewards: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getRewardsContract(rewards, signer)

    try {
      const res = await c.withdrawAllBond()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const withdrawAllEdrf = async (signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getProtocolContract(signer)

    try {
      const res = await c.withdrawAllEdrf()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const redeemBondFromBank = async (rewards: string, amount: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getRewardsContract(rewards, signer)
    const _amount = inputParameterConversion(amount, 8)

    try {
      const gasLimit = await estimateGas(c, 'redeemBondFromBank', [_amount])
      const res = await c.redeemBondFromBank(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const withdrawRankReward = async (rewards: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false
    const c = getRewardsContract(rewards, signer)

    try {
      const res = await c.withdrawRankReward()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const depositBondToBank = async (
    rewards: string,
    bMarginToken: string,
    amount: string,
    signer?: TSigner
  ): Promise<boolean> => {
    if (!signer) return false

    const c = getRewardsContract(rewards, signer)
    const _amount1 = inputParameterConversion(amount, 8)
    const _amount2 = inputParameterConversion(amount, 18)

    try {
      const approve = await allowanceApprove(signer, rewards, bMarginToken, _amount2)

      if (!approve) return false

      const gasLimit = await estimateGas(c, 'depositBondToBank', [_amount1])
      const res = await c.depositBondToBank(_amount1, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const withdrawPositionReward = async (rewards: string | undefined, signer?: TSigner): Promise<boolean> => {
    if (!signer || !rewards) return false
    const c = getRewardsContract(rewards, signer)

    try {
      const res = await c.withdrawPositionReward()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return {
    redeemDrf,
    stakingDrf,
    exchangeBond,
    withdrawAllEdrf,
    withdrawAllBond,
    depositBondToBank,
    withdrawRankReward,
    redeemBondFromBank,
    withdrawPositionReward
  }
}
