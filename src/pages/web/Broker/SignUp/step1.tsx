import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Button from '@/components/common/Button'
import QuestionPopover from '@/components/common/QuestionPopover'
import tokens from '@/config/tokens'
import { useBrokerExtend } from '@/hooks/useBrokerExtend'
import { useBrokerOperation } from '@/hooks/useBrokerOperation'
import { useBalancesStore } from '@/store'
import { PubSubEvents } from '@/typings'
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

  const fetchData = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    setLoading(true)

    if (signer) {
      const status = await applyBroker(brokerExtend.burnLimitAmount, signer)

      if (status) {
        // succeed
        PubSub.publish(PubSubEvents.UPDATE_BROKER_DAT)

        history.push('/broker/sign-up/step2')
      } else {
        // failed
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    setLoading(false)

    window.toast.dismiss(toast)
  }, [address, signer, brokerExtend])

  const memoDisabled = useMemo(() => {
    return (
      isET(balances?.['edrf'] ?? 0, 0) ||
      isET(brokerExtend.burnLimitAmount, 0) ||
      isLT(balances?.['edrf'] ?? 0, brokerExtend.burnLimitAmount)
    )
  }, [balances, brokerExtend.burnLimitAmount])

  const memoInsufficient = useMemo(() => {
    return isET(balances?.['edrf'] ?? 0, 0) || isLT(balances?.['edrf'] ?? 0, brokerExtend.burnLimitAmount)
  }, [balances, brokerExtend.burnLimitAmount])

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
            disabled={!balanceLoaded || memoDisabled || Number(brokerExtend.burnLimitAmount) === 0}
            loading={loading}
          >
            {balanceLoaded && memoInsufficient
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
