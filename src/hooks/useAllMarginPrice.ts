import { useQuery } from '@tanstack/react-query'
import { BigNumberish } from 'ethers'
import { chunk } from 'lodash-es'

import { useEffect, useState } from 'react'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import priceFeedAbi from '@/config/abi/MarginTokenPriceFeed.json'
import contracts from '@/config/contracts'
import { Rec } from '@/typings'
import multicall, { Call } from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

let output = Object.create(null)

export const useAllMarginPrice = (list?: Rec) => {
  const enabled = !!list

  const { data, isLoading } = useQuery(
    ['useAllMarginPrice'],
    async () => {
      if (list) {
        const calls1: Call[] = []
        const calls2: Call[] = []
        const keys = Object.keys(list)
        keys.forEach((key) => {
          calls1.push({
            name: 'getMarginTokenPrice',
            address: list[key],
            marginToken: key
          })
          calls2.push({
            name: 'getMarginTokenDecimals',
            address: list[key],
            marginToken: key
          })
        })

        const response = await multicall(priceFeedAbi, [...calls1, ...calls2])
        const [prices, decimals] = chunk(response, response.length / 2) as [BigNumberish[][], number[]]
        prices.forEach(([data], index: number) => {
          output = {
            ...output,
            [calls1[index].marginToken.toLowerCase()]: formatUnits(data, decimals[index])
          }
        })
      }

      return output
    },
    {
      retry: false,
      enabled,
      initialData: output,
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
