import { useAccount, useSigner } from 'wagmi'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useMemo, useState } from 'react'

import Broker from '@/class/Broker'
import { useAppDispatch } from '@/store'
import { useBalancesStore } from '@/zustand'
import { getBrokerDataAsync } from '@/store/actions'
import { isET, isLT, thousandthsDivision } from '@/utils/tools'

import Button from '@/components/common/Button'
import QuestionPopover from '@/components/common/QuestionPopover'

const BrokerSignUpStep1: FC = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { data: account } = useAccount()
  const { getPrivilegeForBroker, burnLimitAmount } = Broker

  const balances = useBalancesStore((state) => state.balances)
  const balanceLoaded = useBalancesStore((state) => state.loaded)

  const [loading, setLoading] = useState<boolean>(false)

  const getPrivilegeForBrokerCb = useCallback(async () => {
    const toast = window.toast.loading(t('common.pending', 'pending...'))

    setLoading(true)

    if (signer && account?.address) {
      const status = await getPrivilegeForBroker(signer)
      if (status) {
        // succeed
        dispatch(getBrokerDataAsync(account?.address))
        history.push('/broker/sign-up/step2')
      } else {
        // failed
        window.toast.error(t('common.failed', 'failed'))
      }
    }

    setLoading(false)

    window.toast.dismiss(toast)
  }, [signer, account?.address])

  const memoDisabled = useMemo(() => {
    return isET(balances['edrf'], 0) || isET(burnLimitAmount, 0) || isLT(balances['edrf'], burnLimitAmount)
  }, [balances, burnLimitAmount])

  const memoInsufficient = useMemo(() => {
    return isET(balances['edrf'], 0) || isLT(balances['edrf'], burnLimitAmount)
  }, [balances, burnLimitAmount])

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
            {thousandthsDivision(burnLimitAmount)}
            <u>eDRF</u>
          </em>
          <hr />
          <span>
            {t('Broker.Reg.WalletBalance', 'Wallet Balance')}: {thousandthsDivision(balances['edrf'])} eDRF
          </span>
          <address>{account?.address}</address>
        </section>
        <footer className="web-broker-sign-up-footer">
          <Button onClick={getPrivilegeForBrokerCb} disabled={!balanceLoaded || memoDisabled} loading={loading}>
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
