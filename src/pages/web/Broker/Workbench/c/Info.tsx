import React, { FC, useCallback, useState, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { useSigner } from 'wagmi'
import { useTranslation } from 'react-i18next'

import Trader from '@/class/Trader'
import { useAppDispatch } from '@/store'
import { getBrokerDataAsync } from '@/store/trader'
import { useTraderData } from '@/store/trader/hooks'
import { getTraderAsBrokerData } from '@/store/trader/helper'
import { calcSecondsDays, copyText } from '@/utils/tools'

import QuestionPopover from '@/components/common/QuestionPopover'
import Button from '@/components/common/Button'
import Image from '@/components/common/Image'
import ExtendDialog from '@/components/common/Wallet/Extend'

const Info: FC = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { data: signer } = useSigner()
  const { broker } = useTraderData()
  const { extendBrokerPrivilege } = Trader

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

          dispatch(getBrokerDataAsync(account))
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

  return (
    <div className="web-broker-info">
      <header className="web-broker-info-header-layout">
        <div className="web-broker-info-header-ico">
          <Image src={broker?.logo || 'icon/normal-ico.svg'} cover />
        </div>
        <div className="web-broker-info-header">
          <h3>
            {broker?.name} <i className="web-broker-info-edit" onClick={goEdit} />
          </h3>
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
            {t('Broker.BV.ExpireAt', 'expire at')} <time>{memoExpireDate}</time>
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
