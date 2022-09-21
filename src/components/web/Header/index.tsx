import React, { FC, useContext } from 'react'
import classNames from 'classnames'
import { useAccount } from 'wagmi'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { WEBSITE_URL } from '@/config'
import { MobileContext } from '@/context/Mobile'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import AddTokenButton from '@/components/common/Wallet/AddTokenButton'
import SelectNetworkButton from '@/components/common/Wallet/SelectNetworkButton'

import Tool from './Tool'
import MHeader from './MHeader'

const Header: FC = () => {
  const { t } = useTranslation()
  const { data: account } = useAccount()
  const { pathname: P } = useLocation()
  const { mobile } = useContext(MobileContext)

  const handleNavLinkEv = (e: any) => {
    if (!account?.address && /^\/broker\/[0-9a-zA-Z_@$]+$/.test(P)) {
      e.preventDefault()
      return
    }
  }
  if (mobile) return <MHeader />
  return (
    <>
      <header className="web-header">
        <h1 className="web-header-logo">
          <a href={WEBSITE_URL}>Derify protocol</a>
        </h1>
        <nav className="web-header-nav">
          <NavLink to="/trade" onClick={handleNavLinkEv}>
            {t('Nav.Nav.Trade', 'Trade')}
          </NavLink>
          <NavLink to="/earn" onClick={handleNavLinkEv}>
            {t('Nav.Nav.Earn', 'Earn')}
          </NavLink>
          <NavLink to="/dashboard" onClick={handleNavLinkEv}>
            {t('Nav.Nav.Dashboard', 'Dashboard')}
          </NavLink>
          <NavLink to="/broker" className={classNames({ active: P.indexOf('broker') > -1 })} onClick={handleNavLinkEv}>
            {t('Nav.Nav.Broker', 'Broker')}
          </NavLink>
        </nav>
        <div className="web-header-tools">
          <ConnectButton />
          <AddTokenButton />
          <SelectNetworkButton />
          <Tool />
        </div>
      </header>
      <div className="web-header-bg" />
      <div className="web-header-blank" />
    </>
  )
}

export default Header
