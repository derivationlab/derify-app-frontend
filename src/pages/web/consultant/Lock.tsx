import { useSetAtom } from 'jotai'
import { useAccount, useSigner } from 'wagmi'

import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'react-use'

import { asyncConsultantAtom } from '@/atoms/useConsultant'
import Button from '@/components/common/Button'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { useConsultant, useConsultantConf } from '@/hooks/useConsultant'
import { useBalancesStore } from '@/store'
import { isET, isLT, keepDecimals, thousandthsDivision } from '@/utils/tools'

export const advisorConfig = {
  amount: 100
}

const Lock = () => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { addInsurance } = useConsultant()
  const { config } = useConsultantConf()
  const [isLoading, setLoading] = useBoolean(false)

  const balances = useBalancesStore((state) => state.balances)
  const asyncConsultant = useSetAtom(asyncConsultantAtom(address))

  const balance = useMemo(() => balances?.[PLATFORM_TOKEN.symbol] ?? 0, [balances])

  const disabled = useMemo(() => {
    return !signer || isET(balance, 0) || isLT(balance, advisorConfig.amount)
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
        <span>{t('Advisor.amount')}</span>
        <span>
          {thousandthsDivision(advisorConfig.amount)} {PLATFORM_TOKEN.symbol}
        </span>
      </div>
      <div className="web-consultant-item">
        <span>{t('Advisor.period')}</span>
        <span>
          {config.duration} {t('Advisor.days')}
        </span>
      </div>
      <div className="web-consultant-balance">
        <span>{t('Advisor.balance')}</span>
        <span>
          {keepDecimals(balance, PLATFORM_TOKEN.decimals, true)} {PLATFORM_TOKEN.symbol}
        </span>
      </div>
      <Button full onClick={_addInsurance} loading={isLoading} disabled={disabled}>
        {t('Advisor.lock')}
      </Button>
    </section>
  )
}

export default Lock
