import React, { FC } from 'react'

import ConnectButton from '@/components/common/Wallet/ConnectButton'

interface Props {
  br?: string | number
}
const TradeConnect: FC<Props> = ({ br = 48 }) => {
  return (
    <div className="web-trade-data-connect">
      <section className="web-not-connect" style={{ borderRadius: `${br}px` }}>
        <ConnectButton />
      </section>
    </div>
  )
}

export default TradeConnect
