import React, { FC } from 'react'

import AccountInfo from '@/components/common/Wallet/Account/Info'
import DepositButton from '@/components/common/Wallet/DepositButton'
import WithdrawButton from '@/components/common/Wallet/WithdrawButton'
import MarginToken from '@/pages/web/Trade/Bench/c/MarginToken'

const BenchInfo: FC = () => {
  return (
    <div className="web-trade-bench-info">
      <MarginToken />
      {/*<AccountInfo size="mini" />*/}
      {/*<section>*/}
      {/*  <DepositButton size="mini" />*/}
      {/*  <WithdrawButton size="mini" />*/}
      {/*</section>*/}
    </div>
  )
}

export default BenchInfo
