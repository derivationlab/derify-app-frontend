import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useConstantData } from '@/store/constant/hooks'

import BalanceShow from '@/components/common/Wallet/BalanceShow'

const Counts: FC = () => {
  const { t } = useTranslation()
  const { indicator } = useConstantData()

  return (
    <div className="web-dashborad-counts">
      <section>
        <h3>{t('Dashboard.DRFPrice', 'DRF Price')}</h3>
        <main>
          <BalanceShow value={indicator?.drfPrice ?? 0} unit="" />
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.TotalDestroyed', 'Total Destroyed')}</h3>
        <main>
          <BalanceShow value={indicator?.drfBurnt ?? 0} unit="" />
          <u>DRF</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.BuybackPool', 'Buyback Pool')}</h3>
        <main>
          <BalanceShow value={indicator?.drfBuyBack ?? 0} unit="" />
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.eDRFPrice', 'eDRF Price')}</h3>
        <main>
          <BalanceShow value={indicator?.edrfPrice ?? 0} unit="" />
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.bDRFPrice', 'bDRF Price')}</h3>
        <main>
          <BalanceShow value={indicator?.bdrfPrice ?? 0} unit="" />
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
    </div>
  )
}

export default Counts
