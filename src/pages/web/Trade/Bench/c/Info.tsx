import React, { FC } from 'react'

import AccountInfo from '@/components/common/Wallet/Account/Info'
import DepositButton from '@/components/common/Wallet/DepositButton'
import WithdrawButton from '@/components/common/Wallet/WithdrawButton'

const BenchInfo: FC = () => {
  return (
    <div className="web-trade-bench-info">
      <AccountInfo size="mini" />
      <section>
        <DepositButton size="mini" />
        <WithdrawButton size="mini" />
      </section>
    </div>
  )
}

export default BenchInfo
