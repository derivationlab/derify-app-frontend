import classNames from 'classnames'

import React, { FC } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import SelectNetworkButton from '@/components/common/Wallet/SelectNetworkButton'
import { WEBSITE_URL } from '@/config'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'

import MHeader from './MHeader'
import Tool from './Tool'

const Header: FC = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  if (isMobile) return <MHeader />

  return (
    <>
      <header className="web-header">
        <h1 className="web-header-logo">
          <a href={WEBSITE_URL} />
        </h1>
        <nav className="web-header-nav">
          <NavLink to={`/${marginToken.symbol}/trade`}>{t('Nav.Nav.Trade', 'Trade')}</NavLink>
          <NavLink to={`/${marginToken.symbol}/earn`}>{t('Nav.Nav.Earn', 'Earn')}</NavLink>
          <NavLink to={`/${marginToken.symbol}/data`}>{t('Nav.Nav.Data', 'Data')}</NavLink>
          <NavLink to={`/broker`} className={classNames({ active: pathname.indexOf('broker') > -1 })}>
            {t('Nav.Nav.Broker', 'Broker')}
          </NavLink>
          <span className={classNames({ active: pathname.indexOf('dashboard') > -1 })}>
            {t('Nav.Nav.Dashboard', 'Dashboard')}
            <em />
            <ul>
              <li>
                <NavLink to="/dashboard/overview">{t('Nav.Nav.Overview', 'Overview')}</NavLink>
              </li>
              <li>
                <NavLink to={`/dashboard/buyback`}>{t('Nav.Nav.BuybackPlan', 'Buyback Plan')}</NavLink>
              </li>
              <li>
                <NavLink to={`/dashboard/grant`}>{t('Nav.Nav.GrantList', 'Grant List')}</NavLink>
              </li>
            </ul>
          </span>
          <NavLink to="/faucet">{t('Nav.Nav.Faucet')}</NavLink>
          <NavLink to="/advisor">{t('Nav.Nav.Advisor')}</NavLink>
        </nav>
        <div className="web-header-tools">
          <SelectNetworkButton />
          <ConnectButton />
          <Tool />
        </div>
      </header>
      <div className="web-header-bg" />
      <div className="web-header-blank" />
    </>
  )
}

export default Header
