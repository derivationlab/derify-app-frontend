import { createWeb3Name } from '@web3-name-sdk/core'
import { useAccount } from 'wagmi'

import { useEffect, useState } from 'react'

export const useSpaceName = () => {
  const [web3Name] = useState(() => createWeb3Name())

  const { address } = useAccount()

  const [spaceName, setSpaceName] = useState<string | null>(null)

  useEffect(() => {
    const func = async (address: string) => {
      const name = await web3Name.getDomainName({ address:'0x8d1c40E9deeD46A4E9b624668aB409c5071aB40f', queryTldList: ['bnb'] })
      setSpaceName(name)
    }
    if (address) void func(address)
  }, [address])

  return {
    spaceName
  }
}
