import dayjs from 'dayjs'
import { useSigner } from 'wagmi'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useState, useMemo } from 'react'

import Broker from '@/class/Broker'
import { copyText } from '@/utils/tools'
import { useAppDispatch } from '@/store'
import { useTraderData } from '@/store/trader/hooks'
import { getBrokerValidPeriodDataAsync } from '@/store/actions'

import Image from '@/components/common/Image'
import Button from '@/components/common/Button'
import ExtendDialog from '@/components/common/Wallet/Extend'
import QuestionPopover from '@/components/common/QuestionPopover'
import { API_PREFIX_URL } from '@/config'

const Info: FC = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { data: signer } = useSigner()
  const { broker } = useTraderData()
  const { extendBrokerPrivilege } = Broker

  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const goEdit = () => {
    history.push('/broker-edit')
  }

  const extendBrokerPrivilegeCb = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setVisibleStatus('')

      if (signer) {
        const status = await extendBrokerPrivilege(signer, amount)
        const account = await signer.getAddress()
        if (status) {
          // succeed
          window.toast.success(t('common.success', 'success'))

          // dispatch(getBrokerValidPeriodDataAsync(account))
        } else {
          // failed
          window.toast.error(t('common.failed', 'failed'))
        }
      }

      window.toast.dismiss(toast)
    },
    [signer]
  )

  const copyTextEv = () => {
    copyText(broker?.reference).then((res) => {
      if (res) window.toast.success('Copy successfully')
    })
  }

  const memoIsExpired = useMemo(() => {
    return broker?.validPeriodDays <= 0
  }, [broker?.validPeriodDays])

  const memoExpireDate = useMemo(() => {
    const days = broker?.validPeriodDays
    if (days && days >= 0) {
      return dayjs().add(days, 'days').format('YYYY-MM-DD')
    }
    return '0000-00-00'
  }, [broker?.validPeriodDays])

  const memoLogo = useMemo(() => {
    if (broker?.logo) {
      const index = broker.logo.lastIndexOf('/')
      return `${API_PREFIX_URL}${broker.logo.substring(index + 1)}`
    }
    return 'icon/normal-ico.svg'
  }, [])

  return (
    <div className="web-broker-info">
      <header className="web-broker-info-header-layout">
        <div className="web-broker-info-header-ico">
          <Image src={memoLogo} cover />
        </div>
        <div className="web-broker-info-header">
          <h3>
            {broker?.name || '--'} <i className="web-broker-info-edit" onClick={goEdit} />
          </h3>
          {broker?.id && (
            <>
              <small>@{broker?.id}</small>
              <div className="web-broker-info-header-sns">
                {broker?.telegram && <a href={broker?.telegram} target="_blank" className="telegram" />}
                {broker?.discord && <a href={broker?.discord} target="_blank" className="discord" />}
                {broker?.twitter && <a href={broker?.twitter} target="_blank" className="twitter" />}
                {broker?.reddit && <a href={broker?.reddit} target="_blank" className="reddit" />}
                {broker?.wechat && (
                  <QuestionPopover text={`WeChat: ${broker?.wechat}`} size="inline">
                    <a className="wechat" />
                  </QuestionPopover>
                )}
              </div>
              <div className="web-broker-info-header-lang">
                <span>{broker?.language}</span>
              </div>
            </>
          )}
        </div>
      </header>
      <article className="web-broker-info-about" title="The development team of Derify Protocol">
        {broker?.introduction}
      </article>
      <section className="web-broker-info-data">
        <main>
          <dl>
            <dt>
              {t('Broker.BV.BrokerPrivilegeExpiration', 'Broker Privilege Expiration')}
              <QuestionPopover
                size="mini"
                text={t(
                  'Broker.BV.BrokerPrivilegeExpirationTip',
                  'Once your privilege is expired, you will not be able to receive rewards, but your can resume as our Broker whenever you like.'
                )}
              />
            </dt>
            {memoIsExpired ? (
              <dd>
                <del>{t('Broker.BV.Expired', 'Expired')}</del>
              </dd>
            ) : (
              <dd>
                {broker?.validPeriodDays}
                <small>{t('Broker.BV.days', 'days')}</small>
              </dd>
            )}
          </dl>
          <Button size="mini" onClick={() => setVisibleStatus('extend')}>
            {memoIsExpired ? t('Broker.BV.Renew', 'Renew') : t('Broker.BV.Extend', 'Extend')}
          </Button>
        </main>
        <footer className={classNames({ expired: memoIsExpired })}>
          <p>
            {t('Broker.BV.ExpireAt', 'expire at')}
            <time>{memoExpireDate}</time>
          </p>
          <aside>
            <a href={broker?.reference} target="_blank">
              {t('Broker.BV.MyPromotionLink', 'My promotion link')}
            </a>
            <button onClick={copyTextEv} />
            <a href={broker?.reference} target="_blank">
              <i />
            </a>
          </aside>
        </footer>
      </section>

      <ExtendDialog
        visible={visibleStatus === 'extend'}
        onClick={extendBrokerPrivilegeCb}
        onClose={() => setVisibleStatus('')}
      />
    </div>
  )
}

export default Info
