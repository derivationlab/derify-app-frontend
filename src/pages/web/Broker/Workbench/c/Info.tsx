import classNames from 'classnames'
import dayjs from 'dayjs'
import { API_PREFIX_URL } from 'derify-apis'
import { useAtomValue, useSetAtom } from 'jotai'
import PubSub from 'pubsub-js'
import { useAccount, useSigner } from 'wagmi'

import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { useBoolean } from 'react-use'

import {
  asyncBrokerInfoAtom,
  asyncBrokerPrivilegesValidityPeriodAtom,
  brokerInfoAtom,
  brokerPrivilegesValidityPeriodAtom
} from '@/atoms/useBrokerData'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import QuestionPopover from '@/components/common/QuestionPopover'
import ExtendDialog from '@/components/common/Wallet/Extend'
import { useBrokerOperation } from '@/hooks/useBrokerOperation'
import { PubSubEvents } from '@/typings'

const addDay = (d: number) => dayjs().add(d, 'days').format('YYYY-MM-DD')

const Info: FC = () => {
  const history = useHistory()
  const { t } = useTranslation()
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const [visible, setVisible] = useBoolean(false)
  const brokerInfo = useAtomValue(brokerInfoAtom)
  const asyncBrokerInfo = useSetAtom(asyncBrokerInfoAtom(address))
  const brokerPrivilegesValidityPeriod = useAtomValue(brokerPrivilegesValidityPeriodAtom)
  const asyncBrokerPrivilegesValidityPeriod = useSetAtom(asyncBrokerPrivilegesValidityPeriodAtom(address))
  const { extendBrokerPrivilegesValidityPeriod } = useBrokerOperation()

  const extendFunc = useCallback(
    async (amount: string) => {
      setVisible(false)
      const toast = window.toast.loading(t('common.pending'))
      const status = await extendBrokerPrivilegesValidityPeriod(amount, signer)
      if (status) {
        // succeed
        window.toast.success(t('common.success'))
        PubSub.publish(PubSubEvents.UPDATE_BALANCE)
        void (await asyncBrokerPrivilegesValidityPeriod())
      } else {
        // failed
        window.toast.error(t('common.failed'))
      }
      window.toast.dismiss(toast)
    },
    [signer]
  )

  const isExpired = useMemo(() => brokerPrivilegesValidityPeriod <= 0, [brokerPrivilegesValidityPeriod])

  const expireDate = useMemo(
    () => (brokerPrivilegesValidityPeriod >= 0 ? addDay(brokerPrivilegesValidityPeriod) : '0000-00-00'),
    [brokerPrivilegesValidityPeriod]
  )

  const logoURI = useMemo(() => {
    if (brokerInfo?.logo) {
      const logo = brokerInfo.logo
      const index = logo.lastIndexOf('/')
      return `${API_PREFIX_URL}${logo.substring(index + 1)}`
    }
    return 'icon/normal-ico.svg'
  }, [brokerInfo])

  const referral = useMemo(() => `${window.location.origin}/broker/profile/${brokerInfo?.id}`, [brokerInfo])

  useEffect(() => {
    if (address) {
      void asyncBrokerInfo()
      void asyncBrokerPrivilegesValidityPeriod()
    }
  }, [address])

  return (
    <div className="web-broker-info">
      <header className="web-broker-info-header-layout">
        <div className="web-broker-info-header-ico">
          <Image src={logoURI} cover />
        </div>
        <div className="web-broker-info-header">
          <h3>
            {brokerInfo?.name || '--'}{' '}
            <i className="web-broker-info-edit" onClick={() => history.push('/broker/edit')} />
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
            {isExpired ? (
              <dd>
                <del>{t('Broker.BV.Expired', 'Expired')}</del>
              </dd>
            ) : (
              <dd>
                {brokerPrivilegesValidityPeriod ?? 0}
                <small>{t('Broker.BV.days', 'days')}</small>
              </dd>
            )}
          </dl>
          <Button size="mini" onClick={() => setVisible(true)}>
            {isExpired ? t('Broker.BV.Renew', 'Renew') : t('Broker.BV.Extend', 'Extend')}
          </Button>
        </main>
        <footer className={classNames({ expired: isExpired })}>
          <p>
            {t('Broker.BV.ExpireAt', 'expire at')}
            <time>{expireDate}</time>
          </p>
          <aside>
            <a href={referral} target="_blank">
              {t('Broker.BV.MyPromotionLink', 'My promotion link')}
            </a>
            <CopyToClipboard text={referral} onCopy={() => window.toast.success('Copy successfully')}>
              <button />
            </CopyToClipboard>
            <a href={referral} target="_blank">
              <i />
            </a>
          </aside>
        </footer>
      </section>

      <ExtendDialog visible={visible} onClick={extendFunc} onClose={() => setVisible(false)} />
    </div>
  )
}

export default Info
