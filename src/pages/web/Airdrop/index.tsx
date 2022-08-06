import React, { FC } from 'react'

import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

const Airdrop: FC = () => {
  return (
    <div className="web-airdrop">
      <header>
        <main>
          <h3>Total Claimable</h3>
          <BalanceShow value={98644.23} unit="DRF" />
          <p>
            You've earned a total of <strong>987654321.98</strong> DRF
          </p>
        </main>
        <Button>Claim All</Button>
      </header>
      <ul>
        <li>
          <h4>
            AIRDROP ROUND INTRO
            <time>claimeable at 2022-12-31 00:00:00 UTC</time>
          </h4>
          <BalanceShow value={98644.23} unit="DRF" />
          <Button disabled>Claim All</Button>
        </li>
        <li>
          <h4>
            AIRDROP ROUND INTRO
            <time>claimeable at 2022-12-31 00:00:00 UTC</time>
          </h4>
          <BalanceShow value={98644.23} unit="DRF" />
          <Button disabled>Claim All</Button>
        </li>
        <li>
          <h4>AIRDROP ROUND INTRO</h4>
          <BalanceShow value={98644.23} unit="DRF" />
          <Button>Claim All</Button>
        </li>
        <li>
          <h4>AIRDROP ROUND INTRO</h4>
          <BalanceShow value={98644.23} unit="DRF" />
          <Button>Claim All</Button>
        </li>
        <li>
          <h4>AIRDROP ROUND INTRO</h4>
          <BalanceShow value={98644.23} unit="DRF" />
          <Button type="gray">Claim All</Button>
        </li>
        <li>
          <h4>AIRDROP ROUND INTRO</h4>
          <BalanceShow value={98644.23} unit="DRF" />
          <Button type="gray">Claim All</Button>
        </li>
      </ul>
    </div>
  )
}

export default Airdrop
