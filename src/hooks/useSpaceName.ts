import { createWeb3Name } from '@web3-name-sdk/core'
import { useAccount } from 'wagmi'

import { useEffect, useState } from 'react'

const web3Name = createWeb3Name()

export const useSpaceName = () => {
  const { address } = useAccount()

  const [spaceName, setSpaceName] = useState<string | null>(null)

  useEffect(() => {
    const func = async (address: string) => {
      const name = await web3Name.getDomainName({
        address: '0x8d1c40E9deeD46A4E9b624668aB409c5071aB40f',
        queryTldList: ['bnb']
      }).then((res) => {
        console.info(res)
        setSpaceName(res)
      }).then((err) => {
        console.info(err)
      })
      // console.info(web3Name)
      // console.info('name:', name)
      // setSpaceName(name)
    }
    if (address && web3Name) void func(address)
  }, [address])

  return {
    spaceName
  }
}
