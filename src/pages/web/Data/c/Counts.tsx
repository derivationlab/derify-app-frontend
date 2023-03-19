import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentIndexDAT } from '@/hooks/useQueryApi'

import { nonBigNumberInterception } from '@/utils/tools'
import { DEFAULT_MARGIN_TOKEN, findToken } from '@/config/tokens'
import { useMarginToken } from '@/store'

const Counts: FC = () => {
  const { t } = useTranslation()

  const marginToken = useMarginToken((state) => state.marginToken)

  const { data: dashboardDAT, refetch: dashboardDATRefetch } = useCurrentIndexDAT(findToken(marginToken).tokenAddress)

  useEffect(() => {
    void dashboardDATRefetch()
  }, [marginToken])

  return (
    <div className="web-data-counts">
      <section>
        <h3>{t('Dashboard.DRFPrice', 'DRF Price')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(dashboardDAT?.drfPrice ?? 0, 4)}</strong>
          <u>{DEFAULT_MARGIN_TOKEN.symbol}</u>
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
          <u>{DEFAULT_MARGIN_TOKEN.symbol}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.eDRFPrice', 'eDRF Price')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(dashboardDAT?.edrfPrice ?? 0)}</strong>
          <u>{DEFAULT_MARGIN_TOKEN.symbol}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.bDRFPrice', { Token: `bBUSD` })}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(dashboardDAT?.bdrfPrice ?? 0)}</strong>
          <u>{DEFAULT_MARGIN_TOKEN.symbol}</u>
        </main>
      </section>
    </div>
  )
}

export default Counts
