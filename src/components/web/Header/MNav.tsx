import React, { FC, useState, useRef } from 'react'
import { useClickAway } from 'react-use'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'
import classNames from 'classnames'

import { WEBSITE_URL } from '@/config'
import { Communitys } from '@/data/links'

interface Props {
  show: boolean
  list: { url: string; name: string }[]
  onClose: () => void
}

const MNav: FC<Props> = ({ show, list, onClose }) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { pathname: P } = useLocation()
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
    window.open(Communitys[name])
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
          </ul>
        </nav>
        <footer>
          <p>&copy; 2022 Derivation Lab</p>
          <p>
            {Object.keys(Communitys).map((name: string) => (
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
