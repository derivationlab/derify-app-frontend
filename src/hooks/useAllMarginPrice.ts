import { useQuery } from '@tanstack/react-query'
import { BigNumberish } from 'ethers'

import { useEffect, useState } from 'react'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import priceFeedAbi from '@/config/abi/MarginTokenPriceFeed.json'
import contracts from '@/config/contracts'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

let output = Object.create(null)

export const useAllMarginPrice = (list?: Rec) => {
  const enabled = !!list

  const { data, isLoading } = useQuery(
    ['useAllMarginPrice'],
    async () => {
      if (list) {
        const calls = Object.keys(list).map((key) => ({
          name: 'getMarginTokenPrice',
          address: list[key],
          marginToken: key
        }))

        const response = await multicall(priceFeedAbi, calls)

        response.forEach(([data]: BigNumberish[], index: number) => {
          output = {
            ...output,
            [calls[index].marginToken]: formatUnits(data, 8)
          }
        })

        // console.info(output)
        return output
      }

      return null
    },
    {
      retry: false,
      enabled,
      initialData: null,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}

export const useMarginPriceFeed = (list: string[]) => {
  const [priceFeed, setPriceFeed] = useState<Rec>()

  const getPriceFeed = async () => {
    let output = Object.create(null)
    const calls = list.map((address) => {
      return {
        name: 'marginTokenContractCollections',
        params: [address],
        address: contracts.derifyProtocol.contractAddress
      }
    })

    const response = await multicall(derifyProtocolAbi, calls)

    response.forEach(({ marginTokenPriceFeed }: any, index: number) => {
      output = {
        ...output,
        [list[index]]: marginTokenPriceFeed
      }
    })

    setPriceFeed(output)
  }

  useEffect(() => {
    if (list.length) {
      void getPriceFeed()
    }
  }, [list])

  return {
    priceFeed
  }
}
