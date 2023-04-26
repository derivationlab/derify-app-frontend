import React from 'react'
import { WagmiConfig } from 'wagmi'
import type { WagmiConfigProps } from 'wagmi'

import { client } from '@/utils/wagmiConfig'

function Provider(props: React.PropsWithChildren<Omit<WagmiConfigProps, 'client'>>) {
  return <WagmiConfig client={client}>{props.children}</WagmiConfig>
}

export default Provider
