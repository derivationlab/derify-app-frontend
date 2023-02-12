import { isEmpty } from 'lodash'

import { MARGIN_TOKENS } from '@/config/tokens'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { MarginTokenWithContract } from '@/typings'
import { getAddress, getDerifyProtocolAddress } from '@/utils/addressHelpers'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

const contractInfo = {
  factory: '',
  rewards: '',
  exchange: ''
}

export const initial = (): MarginTokenWithContract => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: contractInfo
    }
  })

  return value
}

export const useProtocolConfig = (): { data?: MarginTokenWithContract; isLoading: boolean } => {
  let output = initial()

  const calls = MARGIN_TOKENS.map((t) => ({
    name: 'marginTokenContractCollections',
    params: [getAddress(t.address)],
    address: getDerifyProtocolAddress()
  }))

  const { data, isLoading } = useQueryMulticall(DerifyProtocolAbi, calls, 30000)

  if (!isLoading && !isEmpty(data)) {
    data.forEach(([, , , exchange, factory, rewards]: any[], index: number) => {
      output = {
        ...output,
        [MARGIN_TOKENS[index].symbol]: { exchange, rewards, factory }
      }
    })
    // console.info(output)
    return { data: output, isLoading }
  }

  return { isLoading }
}
