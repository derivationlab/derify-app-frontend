import { useSetAtom } from 'jotai'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import { asyncWhetherUserIsBrokerAtom } from '@/atoms/useBrokerData'
import Button from '@/components/common/Button'
import QuestionPopover from '@/components/common/QuestionPopover'
import tokens from '@/config/tokens'
import { useBrokerExtend } from '@/hooks/useBrokerExtend'
import { useBrokerOperation } from '@/hooks/useBrokerOperation'
import { useBalancesStore } from '@/store'
import { isET, isLT, keepDecimals, nonBigNumberInterception, thousandthsDivision } from '@/utils/tools'

const BrokerSignUpStep1: FC = () => {
  const history = useHistory()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { address } = useAccount()
  const { applyBroker } = useBrokerOperation()
  const { brokerExtend } = useBrokerExtend()
  const balances = useBalancesStore((state) => state.balances)
  const balanceLoaded = useBalancesStore((state) => state.loaded)
  const [loading, setLoading] = useState<boolean>(false)
  const asyncWhetherUserIsBroker = useSetAtom(asyncWhetherUserIsBrokerAtom(address))

  const balance = useMemo(() => balances?.edrf ?? 0, [balances])

  const disabled = useMemo(() => {
    return isET(balance, 0) || isET(brokerExtend.burnLimitAmount, 0) || isLT(balance, brokerExtend.burnLimitAmount)
  }, [balance, brokerExtend.burnLimitAmount])

  const insufficient = useMemo(
    () => isET(balance, 0) || isLT(balance, brokerExtend.burnLimitAmount),
    [balance, brokerExtend.burnLimitAmount]
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    const toast = window.toast.loading(t('common.pending'))
    const status = await applyBroker(brokerExtend.burnLimitAmount, signer)
    if (status) {
      // succeed
      void (await asyncWhetherUserIsBroker())
      history.push('/broker/sign-up/step2')
    } else {
      // failed
      window.toast.error(t('common.failed'))
    }
    setLoading(false)
    window.toast.dismiss(toast)
  }, [address, signer, brokerExtend])

  return (
    <div className="web-broker-sign-up">
      <header className="web-broker-sign-up-header">
        {t('Broker.Reg.Title', 'Burn eDRF to get broker privilege')}
        <QuestionPopover text={t('Broker.Reg.TitleTip', 'Broker can get 30% trading fee & DRF rewards')} />
      </header>
      <div className="web-broker-sign-up-step-layout">
        <section className="web-broker-sign-up-step-1">
          <p>{t('Broker.Reg.Getting', 'Getting broker privilege will cost you')}</p>
          <em>
            {thousandthsDivision(nonBigNumberInterception(brokerExtend.burnLimitAmount, tokens.edrf.decimals))}
            <u>eDRF</u>
          </em>
          <hr />
          <span>
            {t('Broker.Reg.WalletBalance', 'Wallet Balance')}:{' '}
            {keepDecimals(balances?.['edrf'] ?? 0, tokens.edrf.decimals)} eDRF
          </span>
          <address>{address}</address>
        </section>
        <footer className="web-broker-sign-up-footer">
          <Button
            onClick={fetchData}
            disabled={!balanceLoaded || disabled || Number(brokerExtend.burnLimitAmount) === 0}
            loading={loading}
          >
            {balanceLoaded && insufficient
              ? t('Broker.Reg.Insufficient', 'Insufficient eDRF')
              : t('Broker.Reg.Confirm', 'Confirm')}
          </Button>
          <Button outline onClick={() => history.push('/broker')}>
            {t('Broker.Reg.Cancel', 'Cancel')}
          </Button>
        </footer>
      </div>
    </div>
  )
}

export default BrokerSignUpStep1
