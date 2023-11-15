import { createWeb3Name } from '@web3-name-sdk/core'
import { useAccount } from 'wagmi'

import { useEffect, useState } from 'react'

import { CHAIN_ID } from '@/config'

const web3Name = createWeb3Name()

export const useSpaceName = () => {
  const { address } = useAccount()

  const [spaceName, setSpaceName] = useState<string | null>(null)

  useEffect(() => {
    const func = async (address: string) => {
      const name = await web3Name.getDomainName({
        address,
        queryChainIdList: [parseInt(CHAIN_ID, 10)]
      })
      setSpaceName(name)
    }
    if (address) void func(address)
  }, [address])

  return {
    spaceName
  }
}
