import tokens from '@/config/tokens'
import contracts from '@/config/contracts'
import { TSigner } from '@/typings'
import { estimateGas } from '@/utils/estimateGas'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { inputParameterConversion } from '@/utils/tools'
import { getDerifyProtocolContract, getDerifyRewardsContract } from '@/utils/contractHelpers'

export const useRedeemDrf = () => {
  const redeem = async (amount: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyProtocolContract(signer)
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

  return { redeem }
}

export const useStakingDrf = () => {
  const staking = async (amount: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyProtocolContract(signer)
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

  return { staking }
}

export const useExchangeBond = () => {
  const exchange = async (
    rewards: string,
    bMarginToken: string,
    amount: string,
    signer?: TSigner
  ): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyRewardsContract(rewards, signer)
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

  return { exchange }
}

export const useWithdrawAllEdrf = () => {
  const withdraw = async (signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyProtocolContract(signer)

    try {
      const res = await c.withdrawAllEdrf()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { withdraw }
}

export const useWithdrawAllBond = () => {
  const withdraw = async (rewards: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyRewardsContract(rewards, signer)

    try {
      const res = await c.withdrawAllBond()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { withdraw }
}

export const useDepositBondToBank = () => {
  const deposit = async (rewards: string, bMarginToken: string, amount: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyRewardsContract(rewards, signer)
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

  return { deposit }
}

export const useWithdrawRankReward = () => {
  const withdraw = async (rewards: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false
    const c = getDerifyRewardsContract(rewards, signer)

    try {
      const res = await c.withdrawRankReward()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { withdraw }
}

export const useRedeemBondFromBank = () => {
  const redeem = async (rewards: string, amount: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyRewardsContract(rewards, signer)
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

  return { redeem }
}

export const useWithdrawPositionReward = () => {
  const withdraw = async (rewards: string, signer?: TSigner): Promise<boolean> => {
    if (!signer) return false
    const c = getDerifyRewardsContract(rewards, signer)

    try {
      const res = await c.withdrawPositionReward()
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { withdraw }
}
