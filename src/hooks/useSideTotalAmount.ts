import { useQuery } from '@tanstack/react-query'
import { Contract } from 'ethers'
import { chunk, flatten, isEmpty } from 'lodash'
import { useSigner } from 'wagmi'

import { useCallback } from 'react'

import { getDerivativeList } from '@/api'
import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import tokens, { DEFAULT_MARGIN_TOKEN, MARGIN_TOKENS, PLATFORM_TOKEN } from '@/config/tokens'
import { marginTokenList } from '@/store'
import { GrantKeys, MarginToken, MarginTokenKeys, MarginTokenWithQuote, ProtocolConfig, QuoteToken } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import {
  getDerifyPmrContract,
  getDerifyRankContract,
  getDerifyRewardsContract,
  getDerifyBRewardsContract
} from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import multicall from '@/utils/multicall'
import { bnPlus, formatUnits, inputParameterConversion } from '@/utils/tools'

export const _getDerivativeList = async (list: (typeof marginTokenList)[]) => {
  const promises = list.map(async (l) => await getDerivativeList(l.margin_token))

  const response = await Promise.all(promises)
  console.info(response)
}

export const useAllMarginDerivative = (list: (typeof marginTokenList)[]) => {}

// export const useSideTotalAmount = (list: typeof marginTokenList[]) => {
//   const { data, refetch } = useQuery(
//     ['usePositionInfo'],
//     async () => {
//       if (config && config[DEFAULT_MARGIN_TOKEN.symbol as MarginTokenKeys].BTC) {
//         const calls = Object.values(config).map((quotes: QuoteToken, j) =>
//           Object.values(quotes).map((quote, k) => ({
//             name: 'getSideTotalAmount',
//             address: quote,
//             quoteToken: Object.keys(quotes)[k],
//             marginToken: Object.keys(config)[j]
//           }))
//         )
//         const flatterCalls = flatten(calls)
//
//         const response = await multicall(derifyDerivativeAbi, flatterCalls)
//
//         if (response.length > 0) {
//           const _chunk = chunk(response, response.length / 2)
//           _chunk.forEach((values: any, index: number) => {
//             const sum = values.reduce((s1: number, [longTotalAmount, shortTotalAmount]: any[]) => {
//               const s2 = bnPlus(formatUnits(longTotalAmount, 8), formatUnits(shortTotalAmount, 8))
//               return bnPlus(s1, s2)
//             }, 0)
//             outputInit = {
//               ...outputInit,
//               [Object.keys(config)[index]]: sum
//             }
//           })
//
//           // console.info(output)
//
//           return outputInit
//         }
//
//         return outputInit
//       }
//
//       return outputInit
//     },
//     {
//       retry: false,
//       initialData: outputInit,
//       refetchInterval: 6000,
//       keepPreviousData: true,
//       refetchOnWindowFocus: false
//     }
//   )
//
//   return { data, refetch }
// }
