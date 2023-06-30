import classNames from 'classnames'
import { useAccount } from 'wagmi'

import React, { FC, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { useClickAway } from 'react-use'

import { WEBSITE_URL, Communities } from '@/config'

interface Props {
  show: boolean
  list: { url: string; name: string }[]
  onClose: () => void
}

const MNav: FC<Props> = ({ show, list, onClose }) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { pathname: P } = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const ref = useRef(null)
  useClickAway(ref, () => onClose())

  const handleNavLinkEv = (e: any) => {
    if (!address && /^\/broker\/[0-9a-zA-Z_@$]+$/.test(P)) {
      e.preventDefault()
      return
    } else {
      onClose()
    }
  }
  const goLink = (name: string) => {
    // @ts-ignore
    window.open(Communities[name])
  }

  return (
    <div className={classNames('m-nav-layout', { show })}>
      <div className="m-nav" ref={ref}>
        <h2>
          <a href={WEBSITE_URL} target="_blank">
            Derify protocol
          </a>
        </h2>
        <nav>
          <ul>
            {list.map((item, index: number) => (
              <li key={index}>
                <NavLink
                  to={item.url}
                  onClick={handleNavLinkEv}
                  className={classNames({ active: P.indexOf('broker') > -1 && item.url === '/broker' })}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
            <nav className={classNames({ active: P.indexOf('dashboard') > -1, show: showMenu })}>
              <span onClick={() => setShowMenu(!showMenu)}>
                {t('Nav.Nav.Dashboard', 'Dashboard')} <em />
              </span>
              <ul>
                <li>
                  <NavLink to="/dashboard/overview" onClick={handleNavLinkEv}>
                    {t('Nav.Nav.Overview', 'Overview')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to={`/dashboard/buyback`} onClick={handleNavLinkEv}>
                    {t('Nav.Nav.BuybackPlan', 'Buyback Plan')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to={`/dashboard/grant`} onClick={handleNavLinkEv}>
                    {t('Nav.Nav.GrantList', 'Grant List')}
                  </NavLink>
                </li>
              </ul>
            </nav>
            <li>
              <NavLink to="/faucet" onClick={handleNavLinkEv}>
                {t('Nav.Nav.Faucet')}
              </NavLink>
            </li>
          </ul>
        </nav>
        <footer>
          <p>&copy; 2022 Derivation Lab</p>
          <p>
            {Object.keys(Communities).map((name: string) => (
              <span key={name} className={name.toLowerCase()} onClick={() => goLink(name)}>
                {name}
              </span>
            ))}
          </p>
        </footer>
      </div>
    </div>
  )
}

export default MNav
