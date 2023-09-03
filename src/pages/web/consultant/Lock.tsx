import { useSetAtom } from 'jotai'
import { useAccount, useSigner } from 'wagmi'

import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import { asyncConsultantAtom } from '@/atoms/useConsultant'
import Button from '@/components/common/Button'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { useConsultant } from '@/hooks/useConsultant'
import { useBalancesStore } from '@/store'
import { isET, isLT, keepDecimals, thousandthsDivision } from '@/utils/tools'

export const config = {
  amount: 100000,
  period: 365
}

const Lock = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { addInsurance } = useConsultant()
  const [isLoading, setLoading] = useBoolean(false)

  const balances = useBalancesStore((state) => state.balances)
  const asyncConsultant = useSetAtom(asyncConsultantAtom(address))

  const balance = useMemo(() => balances?.[PLATFORM_TOKEN.symbol] ?? 0, [balances])

  const disabled = useMemo(() => {
    return !signer || isET(balance, 0) || isLT(balance, config.amount)
  }, [signer, balance])

  const _addInsurance = useCallback(async () => {
    setLoading(true)
    const toast = window.toast.loading(t('common.pending'))
    const status = await addInsurance(signer)
    if (status) {
      window.toast.success(t('common.success'))
      void (await asyncConsultant())
    } else {
      window.toast.error(t('common.failed'))
    }
    setLoading(false)
    window.toast.dismiss(toast)
  }, [signer])

  return (
    <section>
      <div className="web-consultant-item">
        <span>{t('Consultant.amount')}</span>
        <span>
          {thousandthsDivision(config.amount)} {PLATFORM_TOKEN.symbol}
        </span>
      </div>
      <div className="web-consultant-item">
        <span>{t('Consultant.period')}</span>
        <span>
          {config.period} {t('Consultant.days')}
        </span>
      </div>
      <div className="web-consultant-balance">
        <span>{t('Consultant.balance')}</span>
        <span>
          {keepDecimals(balance, PLATFORM_TOKEN.decimals, true)} {PLATFORM_TOKEN.symbol}
        </span>
      </div>
      <Button full onClick={_addInsurance} loading={isLoading} disabled={disabled}>
        {t('Consultant.lock')}
      </Button>
    </section>
  )
}

export default Lock
