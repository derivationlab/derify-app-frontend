import { useSigner } from 'wagmi'
import { useCallback } from 'react'

import tokens from '@/config/tokens'
import contracts from '@/config/contracts'
import { inputParameterConversion } from '@/utils/tools'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import { getDerifyProtocolContract, getDerifyRewardsContract } from '@/utils/contractHelpers'
import { Signer } from 'ethers'

export const useWithdrawPositionReward = () => {
  const { data: signer } = useSigner()

  const withdraw = useCallback(
    async (rewards: string): Promise<boolean> => {
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
    },
    [signer]
  )

  return { withdraw }
}

export const useWithdrawAllEdrf = () => {
  const withdraw = async (rewards: string, signer?: S): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyRewardsContract(rewards, signer)

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
  const { data: signer } = useSigner()

  const withdraw = useCallback(
    async (rewards: string): Promise<boolean> => {
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
    },
    [signer]
  )

  return { withdraw }
}

export const useWithdrawRankReward = () => {
  const { data: signer } = useSigner()

  const withdraw = useCallback(
    async (rewards: string): Promise<boolean> => {
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
    },
    [signer]
  )

  return { withdraw }
}

type S = Signer | null | undefined

export const useStakingDrf = () => {
  const staking = async (amount: string, signer?: S): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyProtocolContract(signer)
    const _amount = inputParameterConversion(amount, 8)

    try {
      const approve = await setAllowance(
        signer,
        contracts.derifyProtocol.contractAddress,
        tokens.drf.tokenAddress,
        _amount
      )

      if (!approve) return false

      const gasLimit = await estimateGas(c, 'stakingDrf', [_amount], 0)
      const res = await c.stakingDrf(_amount, { gasLimit })
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
  const { data: signer } = useSigner()

  const exchange = useCallback(
    async (rewards: string, bMarginToken: string, amount: string): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyRewardsContract(rewards, signer)
      const _amount = inputParameterConversion(amount, 8)

      try {
        const approve = await setAllowance(signer, rewards, bMarginToken, _amount)

        if (!approve) return false

        const gasLimit = await estimateGas(c, 'exchangeBond', [_amount], 0)
        const res = await c.exchangeBond(_amount, { gasLimit })
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  return { exchange }
}

export const useRedeemDrf = () => {
  const redeem = async (rewards: string, amount: string, signer?: S): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyRewardsContract(rewards, signer)
    const _amount = inputParameterConversion(amount, 8)

    try {
      const gasLimit = await estimateGas(c, 'redeemDrf', [_amount], 0)
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

export const useRedeemBondFromBank = () => {
  const { data: signer } = useSigner()

  const redeem = useCallback(
    async (rewards: string, amount: string): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyRewardsContract(rewards, signer)
      const _amount = inputParameterConversion(amount, 8)

      try {
        const gasLimit = await estimateGas(c, 'redeemBondFromBank', [_amount], 0)
        const res = await c.redeemBondFromBank(_amount, { gasLimit })
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  return { redeem }
}

export const useDepositBondToBank = () => {
  const { data: signer } = useSigner()

  const deposit = useCallback(
    async (rewards: string, bMarginToken: string, amount: string): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyRewardsContract(rewards, signer)
      const _amount = inputParameterConversion(amount, 8)

      try {
        const approve = await setAllowance(signer, rewards, bMarginToken, _amount)

        if (!approve) return false

        const gasLimit = await estimateGas(c, 'depositBondToBank', [_amount], 0)
        const res = await c.depositBondToBank(_amount, { gasLimit })
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  return { deposit }
}
