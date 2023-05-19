import { create } from 'zustand'
import { chunk, flatten } from 'lodash'
import { formatUnits } from '@/utils/tools'
import { derivativeList } from '@/store/useDerivativeList'
import { OpeningMaxLimitState } from '@/store/types'
import multicall from '@/utils/multicall'
import exchangeAbi from '@/config/abi/DerifyExchange.json'

const getOpeningMaxLimit = async (address: string, list: (typeof derivativeList)[]) => {
  const output = Object.create(null)
  const calls = list.map((derivative) => {
    const base = {
      name: 'getSysOpenUpperBound',
      token: derivative.token,
      address
    }
    return [
      { ...base, params: [derivative.token, 0] },
      { ...base, params: [derivative.token, 1] }
    ]
  })

  // console.info(calls)
  const response = await multicall(exchangeAbi, flatten(calls))
  if (response.length) {
    const _chunk = chunk(response, 2)
    _chunk.forEach((data, index: number) => {
      const [long, short] = data
      output[calls[index][0].token] = {
        ...output[calls[index][0].token],
        long: formatUnits(String(long), 8),
        short: formatUnits(String(short), 8)
      }
    })
    // console.info(output)
    return output
  }

  return null
}

const useOpeningMaxLimitStore = create<OpeningMaxLimitState>((set) => ({
  openingMaxLimit: null,
  openingMaxLimitLoaded: false,
  getOpeningMaxLimit: async (address: string, list: typeof derivativeList[]) =>{
    const data = await getOpeningMaxLimit(address, list)

    console.info('getOpeningMaxLimit:')
    console.info(data)

    set({ openingMaxLimit: data })
  }
}))

export { useOpeningMaxLimitStore }
