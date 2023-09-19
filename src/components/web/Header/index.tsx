import classNames from 'classnames'

import React, { FC } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import SelectNetworkButton from '@/components/common/Wallet/SelectNetworkButton'
import NavDashboard from '@/components/web/Header/NavDashboard'
import { useBrokerInvite } from '@/components/web/Header/hooks'
import { WEBSITE_URL } from '@/config'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'

import MHeader from './MHeader'
import Tool from './Tool'

export const _NavLink = NavLink as any

const Header: FC = () => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { disabled } = useBrokerInvite(pathname)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  if (isMobile) return <MHeader />

  return (
    <>
      <header className="web-header">
        <h1 className="web-header-logo">
          <a href={WEBSITE_URL} />
        </h1>
        <nav className={classNames('web-header-nav', { disabled: disabled })}>
          <_NavLink to={`/${marginToken.symbol}/trade`}>{t('Nav.Nav.Trade', 'Trade')}</_NavLink>
          <_NavLink to={`/${marginToken.symbol}/earn`}>{t('Nav.Nav.Earn', 'Earn')}</_NavLink>
          <_NavLink to={`/${marginToken.symbol}/data`}>{t('Nav.Nav.Data', 'Data')}</_NavLink>
          <_NavLink to={`/broker`} className={classNames({ active: pathname.indexOf('broker') > -1 })}>
            {t('Nav.Nav.Broker', 'Broker')}
          </_NavLink>
          <NavDashboard />
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
