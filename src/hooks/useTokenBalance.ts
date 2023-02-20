import { useSigner, useBlockNumber } from 'wagmi'
import { useCallback, useEffect, useState } from 'react'
import { getBep20Contract } from '@/utils/contractHelpers'
import { baseProvider } from '@/utils/baseProvider'
import { safeInterceptionValues } from '@/utils/tools'

export const useTokenBalance = (tokenAddress?: string): any => {
  const { data: signer } = useSigner()
  const { data: blockNumber } = useBlockNumber({ watch: true })

  const [balance, setBalance] = useState<string>('0')
  const [balanceLoaded, setBalanceLoaded] = useState<boolean>(true)

  const func = useCallback(async () => {
    setBalanceLoaded(true)

    if (signer && signer?.getAddress) {
      const account = await signer.getAddress()

      if (tokenAddress) {
        const contract = getBep20Contract(tokenAddress, signer)
        const balance = await contract.balanceOf(account)
        setBalance(safeInterceptionValues(balance, 8, 18))
      } else {
        const balance = await baseProvider.getBalance(account)
        setBalance(safeInterceptionValues(balance, 8, 18))
      }
    }

    setBalanceLoaded(false)
  }, [tokenAddress, signer])

  useEffect(() => {
    if (blockNumber) void func()
  }, [blockNumber])

  return { balance, balanceLoaded }
}
