import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useConstantData } from '@/store/constant/hooks'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { nonBigNumberInterception } from '@/utils/tools'

const Counts: FC = () => {
  const { t } = useTranslation()
  const { indicator } = useConstantData()

  return (
    <div className="web-data-counts">
      <section>
        <h3>{t('Dashboard.DRFPrice', 'DRF Price')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(indicator?.drfPrice ?? 0, 4)}</strong>
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.TotalDestroyed', 'Total Destroyed')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(indicator?.drfBurnt ?? 0)}</strong>
          <u>DRF</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.BuybackPool', 'Buyback Pool')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(indicator?.drfBuyBack ?? 0)}</strong>
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.eDRFPrice', 'eDRF Price')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(indicator?.edrfPrice ?? 0)}</strong>
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
      <section>
        <h3>{t('Dashboard.bDRFPrice', 'bBUSD Price')}</h3>
        <main className="web-balance-show">
          <strong>{nonBigNumberInterception(indicator?.bdrfPrice ?? 0)}</strong>
          <u>{BASE_TOKEN_SYMBOL}</u>
        </main>
      </section>
    </div>
  )
}

export default Counts
