import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import React, { FC, useContext } from 'react'

import { WEBSITE_URL } from '@/config'
import { MobileContext } from '@/providers/Mobile'
import { useMarginToken } from '@/store'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import SelectNetworkButton from '@/components/common/Wallet/SelectNetworkButton'

import Tool from './Tool'
import MHeader from './MHeader'

const Header: FC = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginToken((state) => state.marginToken)

  if (mobile) return <MHeader />

  return (
    <>
      <header className="web-header">
        <h1 className="web-header-logo">
          <a href={WEBSITE_URL}>Derify protocol</a>
        </h1>
        <nav className="web-header-nav">
          <NavLink to={`/${marginToken}/trade`}>{t('Nav.Nav.Trade', 'Trade')}</NavLink>
          <NavLink to={`/${marginToken}/earn`}>{t('Nav.Nav.Earn', 'Earn')}</NavLink>
          <NavLink to={`/${marginToken}/data`}>{t('Nav.Nav.Data', 'Data')}</NavLink>
          <NavLink to={`/broker`} className={classNames({ active: pathname.indexOf('broker') > -1 })}>
            {t('Nav.Nav.Broker', 'Broker')}
          </NavLink>
          <span className={classNames({ active: pathname.indexOf('dashboard') > -1 })}>
            {t('Nav.Nav.Dashboard', 'Dashboard')}
            <em />
            <ul>
              <li>
                <NavLink to="/dashboard/overview">Overview</NavLink>
              </li>
              <li>
                <NavLink to={`/dashboard/buyback`}>Buyback Plan</NavLink>
              </li>
              <li>
                <NavLink to={`/dashboard/grant`}>Grant List</NavLink>
              </li>
            </ul>
          </span>
          <NavLink to="/faucet">{t('Nav.Nav.Faucet')}</NavLink>
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
