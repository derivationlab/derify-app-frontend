import { useAccount, useNetwork } from 'wagmi'

import React, { FC, useMemo } from 'react'

import Button from '@/components/common/Button'
import NotConnect from '@/components/web/NotConnect'
import { FaucetLinks } from '@/data/links'

const Faucet: FC = () => {
  const { address } = useAccount()
  const { chain } = useNetwork()

  const targetTokenInfo = useMemo(() => {
    const symbol = chain?.nativeCurrency?.symbol
    if (symbol) return [symbol, FaucetLinks[symbol]]
    return ['', '']
  }, [chain])

  if (!address) {
    return (
      <div className="web-broker-not-connect">
        <NotConnect />
      </div>
    )
  }

  return (
    <div className="web-faucet">
      <Button size="mini" onClick={() => window.open(FaucetLinks.tTOKEN)}>
        Get 10,000 tTOKEN
      </Button>
      <a href={FaucetLinks.BNB} target="_blank">
        Get testnet {targetTokenInfo[0]} from official faucet
      </a>
    </div>
  )
}

export default Faucet
