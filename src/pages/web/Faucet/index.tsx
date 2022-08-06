import React, { FC, useEffect, useState, useMemo } from 'react'
import { useAccount, useNetwork } from 'wagmi'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { isClaimedTestUSDT } from '@/api'
import { FaucetLinks } from '@/data/links'

import NotConnect from '@/components/web/NotConnect'
import Button from '@/components/common/Button'

const Faucet: FC = () => {
  const { data: account } = useAccount()
  const { activeChain } = useNetwork()

  const [isClaimed, setIsClaimed] = useState<boolean>(false)

  const isClaimedTestUSDTFunc = async (account: string) => {
    const { data: status } = await isClaimedTestUSDT(account)
    setIsClaimed(status)
  }

  const targetTokenInfo = useMemo(() => {
    const symbol = activeChain?.nativeCurrency?.symbol
    if (symbol) return [symbol, FaucetLinks[symbol]]
    return ['', '']
  }, [activeChain])

  useEffect(() => {
    // if (account?.address) void isClaimedTestUSDTFunc(account.address)
  }, [account?.address])

  if (!account?.address) {
    return (
      <div className="web-broker-not-connect">
        <NotConnect />
      </div>
    )
  }

  return (
    <div className="web-faucet">
      {!isClaimed ? (
        <Button size="mini" onClick={() => window.open(FaucetLinks[BASE_TOKEN_SYMBOL])}>
          Get 100,000 tBUSD
        </Button>
      ) : (
        <Button type="gray" size="mini">
          You've claimed tBUSD
        </Button>
      )}
      <a href={targetTokenInfo[1]} target="_blank">
        Get testnet {targetTokenInfo[0]} from official faucet
      </a>
    </div>
  )
}

export default Faucet
