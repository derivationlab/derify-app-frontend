import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useSigner } from 'wagmi'
import { useHistory } from 'react-router-dom'
import BN from 'bignumber.js'
import { useTranslation } from 'react-i18next'

import Trader from '@/class/Trader'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { getEDRFAddress } from '@/utils/addressHelpers'
import { thousandthsDivision } from '@/utils/tools'

import { getBrokerDataAsync } from '@/store/trader'
import { useAppDispatch } from '@/store'

import QuestionPopover from '@/components/common/QuestionPopover'
import Button from '@/components/common/Button'

const BrokerSignUpStep1: FC = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { data: account } = useAccount()
  const { getPrivilegeForBroker, burnLimit } = Trader
  const { balance, balanceLoaded } = useTokenBalance(getEDRFAddress())

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
    const _balance = new BN(balance)
    const _burnLimit = new BN(burnLimit)
    return _balance.isEqualTo(0) || _burnLimit.isEqualTo(0) || _balance.isLessThan(burnLimit)
  }, [balance, burnLimit])

  const memoInsufficient = useMemo(() => {
    const _balance = new BN(balance)
    return _balance.isEqualTo(0) || _balance.isLessThan(burnLimit)
  }, [balance, burnLimit])

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
            {thousandthsDivision(burnLimit)}
            <u>eDRF</u>
          </em>
          <hr />
          <span>
            {t('Broker.Reg.WalletBalance', 'Wallet Balance')}: {thousandthsDivision(balance)} eDRF
          </span>
          <address>{account?.address}</address>
        </section>
        <footer className="web-broker-sign-up-footer">
          <Button onClick={getPrivilegeForBrokerCb} disabled={balanceLoaded || memoDisabled} loading={loading}>
            {!balanceLoaded && memoInsufficient
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
