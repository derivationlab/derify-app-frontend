import { createWeb3Name } from '@web3-name-sdk/core'
import { useAccount } from 'wagmi'

import { useEffect, useState } from 'react'

export const useSpaceName = () => {
  const [web3Name] = useState(() => createWeb3Name())

  const { address } = useAccount()

  const [spaceName, setSpaceName] = useState<string | null>(null)

  useEffect(() => {
    const func = async (address: string) => {
      const name = await web3Name.getDomainName({ address, queryTldList: ['bnb'] })
      setSpaceName(name)
    }
    if (address) void func(address)
  }, [address])

  return {
    spaceName
  }
}
