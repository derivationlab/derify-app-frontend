import dayjs from 'dayjs'
import PubSub from 'pubsub-js'
import classNames from 'classnames'
import { useSigner } from 'wagmi'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useState, useMemo } from 'react'

import { copyText } from '@/utils/tools'
import { PubSubEvents } from '@/typings'
import { API_PREFIX_URL } from '@/config'
import { useExtendPeriod } from '@/hooks/useBroker'
import { useBrokerInfoStore } from '@/store'

import Image from '@/components/common/Image'
import Button from '@/components/common/Button'
import ExtendDialog from '@/components/common/Wallet/Extend'
import QuestionPopover from '@/components/common/QuestionPopover'

const Info: FC = () => {
  const history = useHistory()

  const { t } = useTranslation()
  const { data: signer } = useSigner()

  const { extend } = useExtendPeriod()

  const brokerInfo = useBrokerInfoStore((state) => state.brokerInfo)

  const [visibleStatus, setVisibleStatus] = useState<string>('')

  const goEdit = () => {
    history.push('/broker/edit')
  }

  const extendFunc = useCallback(
    async (amount: string) => {
      const toast = window.toast.loading(t('common.pending', 'pending...'))

      setVisibleStatus('')

      if (signer) {
        const status = await extend(amount, signer)

        if (status) {
          // succeed
          window.toast.success(t('common.success', 'success'))

          PubSub.publish(PubSubEvents.UPDATE_BALANCE)
          PubSub.publish(PubSubEvents.UPDATE_BROKER_DAT)
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
    copyText(`${window.location.origin}/broker/profile/${brokerInfo?.id}`).then((res) => {
      if (res) window.toast.success('Copy successfully')
    })
  }

  const memoIsExpired = useMemo(() => {
    return brokerInfo?.period <= 0
  }, [brokerInfo])

  const memoExpireDate = useMemo(() => {
    const days = brokerInfo?.period
    if (days && days >= 0) {
      return dayjs().add(days, 'days').format('YYYY-MM-DD')
    }
    return '0000-00-00'
  }, [brokerInfo])

  const memoLogo = useMemo(() => {
    if (brokerInfo?.logo) {
      const index = brokerInfo.logo.lastIndexOf('/')
      return `${API_PREFIX_URL}${brokerInfo.logo.substring(index + 1)}`
    }
    return 'icon/normal-ico.svg'
  }, [brokerInfo])

  return (
    <div className="web-broker-info">
      <header className="web-broker-info-header-layout">
        <div className="web-broker-info-header-ico">
          <Image src={memoLogo} cover />
        </div>
        <div className="web-broker-info-header">
          <h3>
            {brokerInfo?.name || '--'} <i className="web-broker-info-edit" onClick={goEdit} />
          </h3>
          {brokerInfo?.id && (
            <>
              <small>@{brokerInfo?.id}</small>
              <div className="web-broker-info-header-sns">
                {brokerInfo?.telegram && <a href={brokerInfo?.telegram} target="_blank" className="telegram" />}
                {brokerInfo?.discord && <a href={brokerInfo?.discord} target="_blank" className="discord" />}
                {brokerInfo?.twitter && <a href={brokerInfo?.twitter} target="_blank" className="twitter" />}
                {brokerInfo?.reddit && <a href={brokerInfo?.reddit} target="_blank" className="reddit" />}
                {brokerInfo?.wechat && (
                  <QuestionPopover text={`WeChat: ${brokerInfo?.wechat}`} size="inline">
                    <a className="wechat" />
                  </QuestionPopover>
                )}
              </div>
              <div className="web-broker-info-header-lang">
                <span>{brokerInfo?.language}</span>
              </div>
            </>
          )}
        </div>
      </header>
      <article className="web-broker-info-about" title="The development team of Derify Protocol">
        {brokerInfo?.introduction}
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
                {brokerInfo?.period ?? 0}
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
            <a href={`${window.location.origin}/broker/profile/${brokerInfo?.id}`} target="_blank">
              {t('Broker.BV.MyPromotionLink', 'My promotion link')}
            </a>
            <button onClick={copyTextEv} />
            <a href={`${window.location.origin}/broker/profile/${brokerInfo?.id}`} target="_blank">
              <i />
            </a>
          </aside>
        </footer>
      </section>

      <ExtendDialog visible={visibleStatus === 'extend'} onClick={extendFunc} onClose={() => setVisibleStatus('')} />
    </div>
  )
}

export default Info
