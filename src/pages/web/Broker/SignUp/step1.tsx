import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useMemo, useState } from 'react'

import { PubSubEvents } from '@/typings'
import { useApplyBroker } from '@/hooks/useBroker'
import { useConfigInfo, useTokenBalances } from '@/zustand'
import { isET, isLT, thousandthsDivision } from '@/utils/tools'

import Button from '@/components/common/Button'
import QuestionPopover from '@/components/common/QuestionPopover'

const BrokerSignUpStep1: FC = () => {
  const history = useHistory()

  const { t } = useTranslation()
  const { data: account } = useAccount()

  const { applyBroker } = useApplyBroker()

  const balances = useTokenBalances((state) => state.balances)
  const brokerParams = useConfigInfo((state) => state.brokerParams)
  const balanceLoaded = useTokenBalances((state) => state.loaded)

  const [loading, setLoading] = useState<boolean>(false)

  const fetchData = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    setLoading(true)

    const status = await applyBroker(brokerParams.burnLimitAmount)

    if (status) {
      // succeed
      PubSub.publish(PubSubEvents.UPDATE_BROKER_DAT)

      history.push('/broker/sign-up/step2')
    } else {
      // failed
      window.toast.error(t('common.failed', 'failed'))
    }

    setLoading(false)

    window.toast.dismiss(toast)
  }, [account?.address])

  const memoDisabled = useMemo(() => {
    return (
      isET(balances['edrf'], 0) ||
      isET(brokerParams.burnLimitAmount, 0) ||
      isLT(balances['edrf'], brokerParams.burnLimitAmount)
    )
  }, [balances, brokerParams.burnLimitAmount])

  const memoInsufficient = useMemo(() => {
    return isET(balances['edrf'], 0) || isLT(balances['edrf'], brokerParams.burnLimitAmount)
  }, [balances, brokerParams.burnLimitAmount])

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
            {thousandthsDivision(brokerParams.burnLimitAmount)}
            <u>eDRF</u>
          </em>
          <hr />
          <span>
            {t('Broker.Reg.WalletBalance', 'Wallet Balance')}: {thousandthsDivision(balances['edrf'])} eDRF
          </span>
          <address>{account?.address}</address>
        </section>
        <footer className="web-broker-sign-up-footer">
          <Button onClick={fetchData} disabled={!balanceLoaded || memoDisabled} loading={loading}>
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
