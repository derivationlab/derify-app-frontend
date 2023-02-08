import { useMemo } from 'react'
import { isEmpty } from 'lodash'

import { quoteTokensInitial } from '@/config/tokens'
import { contractInfo } from '@/store/config/helper'
import { useContractConfig } from '@/store/config/hooks'

export const useMatchConfig = () => {
  const {
    protocolConfig: _protocolConfig,
    factoryConfig: _factoryConfig,
    marginToken,
    factoryConfigLoaded,
    protocolConfigLoaded
  } = useContractConfig()

  const factoryConfig = useMemo(() => {
    if (factoryConfigLoaded && !isEmpty(_factoryConfig)) return _factoryConfig[marginToken]
    return quoteTokensInitial
  }, [factoryConfigLoaded, marginToken, _factoryConfig])

  const protocolConfig = useMemo(() => {
    if (protocolConfigLoaded && !isEmpty(_protocolConfig)) return _protocolConfig[marginToken]
    return contractInfo
  }, [protocolConfigLoaded, marginToken, _protocolConfig])

  return {
    marginToken,
    factoryConfig,
    protocolConfig,
    factoryConfigLoaded,
    protocolConfigLoaded
  }
}
