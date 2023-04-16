import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import Image from '@/components/common/Image'
import QuestionPopover from '@/components/common/QuestionPopover'
import { useMarginTokenStore } from '@/store'

const BrokerCard: FC<{ broker: Record<string, any> }> = ({ broker }) => {
  const { t } = useTranslation()
  const { id, logo, name, introduction } = broker

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  return (
    <div className="web-my-broker">
      <header className="web-my-broker-header-layout">
        <div className="web-my-broker-header-ico">
          <Image src={logo || 'icon/normal-ico.svg'} cover />
        </div>
        <div className="web-my-broker-header">
          <h3>{name}</h3>
          <small>@{id}</small>
          <div className="web-my-broker-header-sns">
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
          <div className="web-my-broker-header-lang">
            <span>{broker?.language}</span>
          </div>
          <Link className="web-my-broker-header-rank" to={`/${marginToken}/broker/rank`}>
            {t('Broker.BV.RankList', 'Rank List')}
          </Link>
        </div>
      </header>
      <article className="web-my-broker-about">{introduction}</article>
      <section className="web-my-broker-data">
        <dl>
          <dt>{t('Broker.TV.Registered', "You've registered")}</dt>
          <dd>
            <em>{broker?.registration_days}</em>
            <u>{t('Broker.TV.days', 'days')}</u>
          </dd>
        </dl>
        <hr />
        <dl>
          <dt>{t('Broker.TV.made', "You've made")}</dt>
          <dd>
            <em>{broker?.txs_num}</em>
            <u>{t('Broker.TV.transactions', 'transactions')}</u>
          </dd>
        </dl>
      </section>
      <footer className="web-my-broker-footer">
        <Link to="/broker/sign-up/step1">{t('Broker.TV.Join', 'Join us to be a BROKER !')}</Link>
      </footer>
    </div>
  )
}

export default BrokerCard
