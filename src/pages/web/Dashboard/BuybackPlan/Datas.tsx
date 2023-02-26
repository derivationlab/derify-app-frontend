import React, { FC } from 'react'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import DecimalShow from '@/components/common/DecimalShow'

const Datas: FC = () => {
  return (
    <div className="web-dashboard-plan-datas">
      <div className="web-dashboard-plan-datas-item">
        <header>Total Buyback Value</header>
        <section>
          <DecimalShow value={42312.34} black format="0,0.00" />
          <u>USD</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>Current DRF Price</header>
        <section>
          <DecimalShow value={0.45} black format="0,0.00" />
          <u>BUSD</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>Total Destroyed</header>
        <section>
          <DecimalShow value={142312.34} black format="0,0.00 a" />
          <u>DRF</u>
        </section>
      </div>
      <div className="web-dashboard-plan-datas-item">
        <header>Current Block Height</header>
        <section>
          <BalanceShow value={23914639} format="0" unit="" />
          <u>Block</u>
        </section>
      </div>
    </div>
  )
}

export default Datas
