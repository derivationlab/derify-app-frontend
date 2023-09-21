import { useQuery } from '@tanstack/react-query'
import { Contract } from 'ethers'
import { isEmpty } from 'lodash-es'

import multicall, { Call } from '@/utils/multicall'

// CM = Contract Method
type CMName<C extends Contract = Contract> = keyof C['callStatic'] & string
type CMParams<C extends Contract = Contract, M extends CMName<C> = CMName<C>> = Parameters<C['callStatic'][M]>
// QK = Query Key
type QKIsArray<C extends Contract = Contract, M extends CMName<C> = string> = [C, M, CMParams<C, M>] | [C, M]
type QK<C extends Contract = Contract, M extends CMName<C> = string> = QKIsArray<C, M>

export function useQueryContract<
  C extends Contract = Contract,
  M extends CMName<C> = CMName<C>,
  D = Awaited<ReturnType<C['callStatic'][M]>>
>(key: QK<C, M>, refetchInterval = 3000) {
  const [contract, method, params] = key

  const query = useQuery<D>(
    key,
    async () => {
      if (!contract || !method) return null
      if (!params) return contract[method]()
      return contract[method](...params)
    },
    {
      retry: false,
      refetchInterval,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )
  // console.info(query)
  return query
}

export function useQueryMulticall(abi: any[], calls: Call[], refetchInterval = 3000) {
  const query = useQuery(
    [abi, calls],
    async () => {
      if (!abi || isEmpty(calls)) return null
      return multicall(abi, calls)
    },
    {
      retry: false,
      refetchInterval,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )
  // console.info(query)
  return query
}
