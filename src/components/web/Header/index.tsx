import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import React, { FC, useContext, useMemo } from 'react'

import { WEBSITE_URL } from '@/config'
import { MobileContext } from '@/context/Mobile'
import { DEFAULT_MARGIN_TOKEN, MARGIN_TOKENS } from '@/config/tokens'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import AddTokenButton from '@/components/common/Wallet/AddTokenButton'
import SelectNetworkButton from '@/components/common/Wallet/SelectNetworkButton'

import Tool from './Tool'
import MHeader from './MHeader'

const Header: FC = () => {
  const { t } = useTranslation()
  const { pathname: P } = useLocation()
  const { mobile } = useContext(MobileContext)

  const marginToken = useMemo(() => {
    const find = MARGIN_TOKENS.find((m) => P.includes(m.symbol))
    return find?.symbol ?? DEFAULT_MARGIN_TOKEN.symbol
  }, [P])

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
          <NavLink to={`/broker`} className={classNames({ active: P.indexOf('broker') > -1 })}>
            {t('Nav.Nav.Broker', 'Broker')}
          </NavLink>
          <span className={classNames({ active: P.indexOf('dashboard') > -1 })}>
            {t('Nav.Nav.Dashboard', 'Dashboard')}
            <em />
            <ul>
              <li>
                <NavLink to={`/dashboard/overview`}>Overview</NavLink>
              </li>
              <li>
                <NavLink to={`/dashboard/buyback-plan`}>Buyback Plan</NavLink>
              </li>
              <li>
                <NavLink to={`/dashboard/grant-list`}>Grant List</NavLink>
              </li>
            </ul>
          </span>
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
