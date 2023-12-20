import { useAccount } from 'wagmi'

import { useEffect, useState } from 'react'
import { getAddressSpaceName } from 'derify-apis-staging'
import { Rec } from '@/typings'

export const useSpaceName = () => {
  const { address } = useAccount()

  const [spaceName, setSpaceName] = useState<string | null>(null)

  useEffect(() => {
    const func = async (address: string) => {
      const { name } = await getAddressSpaceName<Rec>(address,'bnb')
      setSpaceName(name)
    }
    if (address) void func(address)
  }, [address])

  return {
    spaceName
  }
}
