import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useDashboardDAT } from '@/zustand/useDashboardDAT'

import { nonBigNumberInterception } from '@/utils/tools'
import { useMarginToken } from '@/zustand'

const Counts: FC = () => {
  const { t } = useTranslation()

  const marginToken = useMarginToken((state) => state.marginToken)
  const dashboardDAT = useDashboardDAT((state) => state.dashboardDAT)

  return (
    <div className="web-data-counts">
      <section>
        <h3>{t('Dashboard.DRFPrice', 'DRF Price')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(dashboardDAT?.drfPrice ?? 0, 4)}</strong>
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.TotalDestroyed', 'Total Destroyed')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(dashboardDAT?.drfBurnt ?? 0)}</strong>
          <u>DRF</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.BuybackPool', 'Buyback Pool')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(dashboardDAT?.drfBuyBack ?? 0)}</strong>
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.eDRFPrice', 'eDRF Price')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(dashboardDAT?.edrfPrice ?? 0)}</strong>
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.bDRFPrice', { Token: `b${marginToken}` })}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(dashboardDAT?.bdrfPrice ?? 0)}</strong>
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
    </div>
  )
}

export default Counts
