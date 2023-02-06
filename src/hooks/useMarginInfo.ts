import { useMemo } from 'react'
import { isEmpty } from 'lodash'

import { useContractConfig } from '@/store/config/hooks'

export const useMarginInfo = () => {
  const { contractConfig, marginToken, loaded } = useContractConfig()

  const config = useMemo(() => {
    if (loaded && !isEmpty(contractConfig)) return contractConfig[marginToken]
    return {
      derifyRewards: '',
      derifyExchange: ''
    }
  }, [loaded, marginToken, contractConfig])

  return {
    config, loaded, marginToken
  }
}
