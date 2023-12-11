import { useQuery } from '@tanstack/react-query'
import { getAllMarginPositions } from 'derify-apis-v22'
import { flatten } from 'lodash-es'

import { useEffect, useState } from 'react'

import factoryAbi from '@/config/abi/DerifyFactory.json'
import protocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'

const output = Object.create(null)

export const useMarginPosVolume = () => {
  const { data, refetch } = useQuery(
    ['useMarginPosVolume'],
    async () => {
      const { data } = await getAllMarginPositions<{ data: Rec[] }>()
      if (data) {
        data.forEach((d: Rec) => {
          output[d.margin_token] = {
            ...output[d.margin_token],
            [d.token]: d.total_size
          }
        })
        // console.info(output)
        return output
      }
      return null
    },
    {
      retry: 0,
      initialData: null,
      refetchInterval: 600000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}

export const useFactoryConfig = (marginList: Rec) => {
  const [output, setOutput] = useState<Rec[] | null>(null)

  const func = async (marginList: Rec) => {
    let output = Object.create(null)
    const keys = Object.keys(marginList)
    const calls = keys.map((margin) => ({
      name: 'marginTokenContractCollections',
      params: [margin],
      address: contracts.derifyProtocol.contractAddress
    }))
    const response = await multicall(protocolAbi, calls)
    response.forEach((config: Rec, index: number) => {
      const { derifyFactory } = config
      output = {
        ...output,
        [keys[index]]: derifyFactory
      }
    })
    setOutput(output)
  }

  useEffect(() => {
    if (marginList) {
      void func(marginList)
    }
  }, [marginList])

  return {
    factoryConfig: output
  }
}

export const useTradingAddresses = (factoryConfig: Rec | null, marginList: Rec | null) => {
  const [output, setOutput] = useState<Rec[] | null>(null)

  const func = async (factoryConfig: Rec, marginList: Rec) => {
    let output: any[] = []
    const marginKeys = Object.keys(marginList)
    const calls = marginKeys.map((margin) => {
      const quoteKeys = Object.keys(marginList[margin])
      return quoteKeys.map((quote) => {
        return {
          name: 'getDerivative',
          params: [quote],
          identity: margin,
          address: factoryConfig[margin]
        }
      })
    })
    const _calls = flatten(calls)
    const response = await multicall(factoryAbi, _calls)

    if (response.length) {
      /**
       * {xx:[{ token: xx, derivative: xx }]}
       */
      response.forEach(([derivative]: string[], index: number) => {
        const x = { derivative, token: _calls[index].params[0], margin: _calls[index].identity }
        output = [...output, x]
      })
      // console.info(output)
      setOutput(output)
    }
  }

  useEffect(() => {
    if (factoryConfig && marginList) {
      void func(factoryConfig, marginList)
    }
  }, [factoryConfig, marginList])

  return {
    addresses: output
  }
}

/**
 * { xx:{ a: 1, b: 2 } }
 */
