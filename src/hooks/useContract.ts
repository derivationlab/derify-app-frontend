import { useMemo } from 'react'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { useContract, useProvider, useSigner } from 'wagmi'
import { Contract, ContractInterface } from '@ethersproject/contracts'

const isAddress = (value: any): string | false => {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

/**
 * @param address
 * @param ABI
 * @param withSignerIfPossible
 */
function useContractWrap<T extends Contract = Contract>(
  address: string,
  ABI: ContractInterface,
  withSignerIfPossible = false
): T | null {
  const provider = useProvider()
  const { data: SIGNER, isError, isLoading } = useSigner()

  const signer = useMemo(() => {
    return withSignerIfPossible && !isError && !isLoading && SIGNER ? SIGNER : provider
  }, [withSignerIfPossible, SIGNER, provider, isError, isLoading])
  const canReturn = useMemo(() => address && isAddress(address) && address !== AddressZero && ABI, [address, ABI])

  if (!canReturn) {
    console.error('Please check the parameters: address, ABI')
    return null
  }

  try {
    return useContract({
      addressOrName: address,
      contractInterface: ABI,
      signerOrProvider: signer
    }) as T
  } catch (error) {
    console.error('Failed to get contract', error)
    return null
  }
}

// export function xx(): Contract | null {
//   return useContractWrap(xx(), xx, true)
// }

export default null
